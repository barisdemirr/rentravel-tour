using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public class BungalowSaveHandler(AppDbContext db, MediaItemResolver media, HtmlCleaner html)
{
    public async Task<Result<BungalowDto>> Save(Bungalow? existing, BungalowInput input, CancellationToken ct)
    {
        var validator = new Validator()
            .LocalizedRequired("title", input.Title, 150)
            .LocalizedOptional("description", input.Description, 300)
            .LocalizedOptional("location", input.Location, 150)
            .LocalizedOptional("breakfastNote", input.BreakfastNote, 200)
            .LocalizedOptional("capacity", input.Capacity, 50)
            .LocalizedOptional("locationNote", input.LocationNote, 500)
            .LocalizedOptional("ratingLabel", input.RatingLabel, 60)
            .LocalizedOptional("seoTitle", input.SeoTitle, 120)
            .LocalizedOptional("seoDescription", input.SeoDescription, 300)
            .LocalizedOptional("seoKeywords", input.SeoKeywords, 300)
            .Must("longDescription",
                  input.LongDescription is null || (Len(input.LongDescription.Tr) <= 30000
                      && Len(input.LongDescription.En) <= 30000 && Len(input.LongDescription.Ar) <= 30000),
                  "longDescription her dilde en fazla 30000 karakter olabilir.")
            .Must("ratingScore", input.RatingScore is null or (>= 0 and <= 10),
                  "ratingScore 0 ile 10 arasında olmalı.")
            .Must("ratingCount", input.RatingCount is null or >= 0, "ratingCount negatif olamaz.")
            .Must("defaultPricePerNight", input.DefaultPricePerNight >= 0, "defaultPricePerNight negatif olamaz.")
            .Must("currency", input.Currency is { } c && Enum.IsDefined(c),
                  "currency zorunlu ve geçerli olmalı (TRY, USD, EUR).");

        // Liste alanları
        validator
            .Each("amenities", input.Amenities, 6, (a, f) => validator
                .MaxLength($"{f}.icon", a.Icon, 100)
                .LocalizedRequired($"{f}.label", a.Label, 60)
                .LocalizedOptional($"{f}.value", a.Value, 100))
            .Each("detailedAmenities", input.DetailedAmenities, 40, (a, f) => validator
                .MaxLength($"{f}.icon", a.Icon, 100)
                .LocalizedRequired($"{f}.label", a.Label, 60)
                .LocalizedOptional($"{f}.value", a.Value, 100))
            .Each("featureStrip", input.FeatureStrip, 8, (s, f) => validator
                .MaxLength($"{f}.icon", s.Icon, 100)
                .LocalizedRequired($"{f}.label", s.Label, 60)
                .LocalizedOptional($"{f}.sub", s.Sub, 100)
                .MaxLength($"{f}.tone", s.Tone, 20))
            .Each("distances", input.Distances, 20, (d, f) => validator
                .LocalizedRequired($"{f}.place", d.Place, 100)
                .LocalizedRequired($"{f}.value", d.Value, 50))
            .Each("rules", input.Rules, 20, (r, f) => validator
                .MaxLength($"{f}.icon", r.Icon, 100)
                .LocalizedRequired($"{f}.title", r.Title, 100)
                .LocalizedOptional($"{f}.text", r.Text, 500));

        // Bölge var olmalı
        if (input.RegionId is { } regionId && !await db.BungalowRegions.AnyAsync(x => x.Id == regionId, ct))
            validator.AddError("regionId", "Bölge bulunamadı.");

        // Görseller: id kütüphaneden doğrulanır, url sunucuda üretilir
        var image = await media.ResolveAsync(input.Image, "image", validator, ct);
        var gallery = await media.ResolveManyAsync(input.Gallery, "gallery", validator, ct);
        var ogImage = await media.ResolveAsync(input.OgImage, "ogImage", validator, ct);

        // Kahvaltı kartı: tamamen boşsa "verilmedi", boş etiketler atılır
        BreakfastCard? breakfastCard = null;
        var card = input.BreakfastCard;
        if (card is not null)
        {
            var tags = (card.Tags ?? []).Where(t => !t.IsBlank()).ToList();
            var isEmpty = card.Title.IsBlank() && card.Description.IsBlank() && tags.Count == 0 && card.Image is null;

            if (!isEmpty)
            {
                validator
                    .LocalizedRequired("breakfastCard.title", card.Title, 100)
                    .LocalizedOptional("breakfastCard.description", card.Description, 500)
                    .Each("breakfastCard.tags", tags, 8, (t, f) => validator.LocalizedRequired(f, t, 40));

                var cardImage = await media.ResolveAsync(card.Image, "breakfastCard.image", validator, ct);

                breakfastCard = new BreakfastCard
                {
                    Title = card.Title ?? new(),
                    Image = cardImage,
                    Description = card.Description.OrNull(),
                    Tags = tags
                };
            }
        }

        // Yayınlama kuralları
        if (input.IsActive)
        {
            if (input.Image is null)
                validator.AddError("image", "Yayınlamak için kapak görseli gerekli.");
            if (input.DefaultPricePerNight <= 0)
                validator.AddError("defaultPricePerNight", "Yayınlamak için gecelik fiyat 0'dan büyük olmalı.");
        }

        var plan = SlugResolver.Plan(input.Slug, existing?.Slug, input.Title?.Tr, validator);

        if (!validator.IsValid) return validator.ToFailure<BungalowDto>();

        var currentId = existing?.Id ?? Guid.Empty;
        var (slug, conflict) = await SlugResolver.EnsureUniqueAsync(
            plan, existing is null,
            s => db.Bungalows.AnyAsync(x => x.Slug == s && x.Id != currentId, ct));

        if (conflict is not null) return Result<BungalowDto>.Fail(conflict);

        var bungalow = existing ?? new Bungalow();

        bungalow.Slug = slug;
        bungalow.RegionId = input.RegionId;
        bungalow.Title = input.Title!;
        bungalow.Description = input.Description.OrNull();
        bungalow.LongDescription = html.Clean(input.LongDescription.OrNull());
        bungalow.Location = input.Location.OrNull();
        bungalow.Image = image;
        bungalow.Gallery = gallery;
        bungalow.BreakfastIncluded = input.BreakfastIncluded;
        bungalow.BreakfastNote = input.BreakfastNote.OrNull();
        bungalow.BreakfastCard = breakfastCard;
        bungalow.Capacity = input.Capacity.OrNull();
        bungalow.Amenities = input.Amenities ?? [];
        bungalow.FeatureStrip = input.FeatureStrip ?? [];
        bungalow.DetailedAmenities = input.DetailedAmenities ?? [];
        bungalow.Distances = input.Distances ?? [];
        bungalow.LocationNote = input.LocationNote.OrNull();
        bungalow.Rules = input.Rules ?? [];
        bungalow.RatingLabel = input.RatingLabel.OrNull();
        bungalow.RatingScore = input.RatingScore;
        bungalow.RatingCount = input.RatingCount;
        bungalow.SeoTitle = input.SeoTitle.OrNull();
        bungalow.SeoDescription = input.SeoDescription.OrNull();
        bungalow.SeoKeywords = input.SeoKeywords.OrNull();
        bungalow.OgImage = ogImage;
        bungalow.DefaultPricePerNight = input.DefaultPricePerNight;
        bungalow.Currency = input.Currency!.Value;
        bungalow.IsFeatured = input.IsFeatured;
        bungalow.IsActive = input.IsActive;
        bungalow.OrderIndex = input.OrderIndex;

        if (existing is null) db.Bungalows.Add(bungalow);
        await db.SaveChangesAsync(ct);

        // Bölge bilgisiyle birlikte yeniden oku (silinmiş bölge null görünür)
        var saved = await db.Bungalows.AsNoTracking()
            .Include(x => x.Region)
            .FirstAsync(x => x.Id == bungalow.Id, ct);

        return Result<BungalowDto>.Success(BungalowDto.From(saved));
    }

    private static int Len(string? s) => s?.Length ?? 0;
}