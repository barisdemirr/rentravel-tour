using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.Tours;

// Günübirlik ve kültür turunun ortak alanlarını doğrular ve tour'a uygular.
// Hatalar validator'a eklenir. Çağıran, validator.IsValid'e bakmadan kaydetmemelidir.
public class TourFieldsHandler(AppDbContext db, MediaItemResolver media, HtmlCleaner html)
{
    private static readonly string[] BadgeTones = ["primary", "dark", "vivid", "surface"];

    public async Task ApplyAsync(
        TourBase tour, TourInput input, TourCategoryScope scope, Validator validator, CancellationToken ct)
    {
        var badgeTone = Clean(input.BadgeTone)?.ToLowerInvariant();
        var duration = Clean(input.Duration);
        var transportIcon = Clean(input.TransportIcon);
        var editorial = NormalizeEditorial(input.Editorial);
        var inclusions = NormalizeInclusions(input.Inclusions);
        var travelNotes = (input.TravelNotes ?? [])
            .Where(n => n is not null && !(n.Text.IsBlank() && string.IsNullOrWhiteSpace(n.Icon)))
            .ToList();

        validator
            .LocalizedRequired("title", input.Title, 150)
            .LocalizedOptional("description", input.Description, 300)
            .LocalizedOptional("badge", input.Badge, 60)
            .LocalizedOptional("transport", input.Transport, 100)
            .LocalizedOptional("seoTitle", input.SeoTitle, 120)
            .LocalizedOptional("seoDescription", input.SeoDescription, 300)
            .LocalizedOptional("seoKeywords", input.SeoKeywords, 300)
            .MaxLength("duration", duration, 50)
            .MaxLength("transportIcon", transportIcon, 100)
            .Must("badgeTone", badgeTone is null || BadgeTones.Contains(badgeTone),
                  "badgeTone geçersiz (primary, dark, vivid, surface).")
            .Must("longDescription",
                  input.LongDescription is null || (Len(input.LongDescription.Tr) <= 30000
                      && Len(input.LongDescription.En) <= 30000 && Len(input.LongDescription.Ar) <= 30000),
                  "longDescription her dilde en fazla 30000 karakter olabilir.")
            .Must("seatsTotal", input.SeatsTotal >= 0, "seatsTotal negatif olamaz.")
            .Must("defaultBasePrice", input.DefaultBasePrice >= 0, "defaultBasePrice negatif olamaz.")
            .Must("currency", input.Currency is { } c && Enum.IsDefined(c),
                  "currency zorunlu ve geçerli olmalı (TRY, USD, EUR).");

        // Liste alanları
        Each(validator, "badges", input.Badges, 10, (b, f) => validator
            .MaxLength($"{f}.icon", b.Icon, 100)
            .LocalizedRequired($"{f}.label", b.Label, 60)
            .MaxLength($"{f}.tone", b.Tone, 20));

        Each(validator, "routePills", input.RoutePills, 15, (p, f) => validator
            .LocalizedRequired($"{f}.label", p.Label, 60)
            .MaxLength($"{f}.icon", p.Icon, 100));

        Each(validator, "quickSpecs", input.QuickSpecs, 12, (s, f) => validator
            .MaxLength($"{f}.icon", s.Icon, 100)
            .LocalizedRequired($"{f}.label", s.Label, 60)
            .LocalizedOptional($"{f}.sub", s.Sub, 100)
            .MaxLength($"{f}.tone", s.Tone, 20));

        Each(validator, "itinerary", input.Itinerary, 30, (i, f) => validator
            .MaxLength($"{f}.icon", i.Icon, 100)
            .MaxLength($"{f}.time", i.Time, 20)
            .LocalizedRequired($"{f}.title", i.Title, 150)
            .LocalizedOptional($"{f}.description", i.Description, 1000));

        Each(validator, "travelNotes", travelNotes, 20, CheckListItem(validator));

        if (inclusions is not null)
        {
            Each(validator, "inclusions.included", inclusions.Included, 30, CheckListItem(validator));
            Each(validator, "inclusions.excluded", inclusions.Excluded, 30, CheckListItem(validator));
        }

        if (editorial is not null)
        {
            validator
                .LocalizedOptional("editorial.eyebrow", editorial.Eyebrow, 60)
                .MaxLength("editorial.eyebrowIcon", editorial.EyebrowIcon, 100)
                .LocalizedRequired("editorial.title", editorial.Title, 150);

            Each(validator, "editorial.paragraphs", editorial.Paragraphs, 10,
                (p, f) => validator.LocalizedRequired(f, p, 2000));
            Each(validator, "editorial.highlights", editorial.Highlights, 10,
                (h, f) => validator.LocalizedRequired(f, h, 200));
        }

        // Kategori: var olmalı ve bu tur tipine uygun olmalı
        if (input.CategoryId is { } categoryId)
        {
            var category = await db.TourCategories.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == categoryId, ct);

            if (category is null)
                validator.AddError("categoryId", "Kategori bulunamadı.");
            else if (category.AppliesTo != TourCategoryScope.Both && category.AppliesTo != scope)
                validator.AddError("categoryId",
                    $"'{category.Key}' kategorisi bu tur tipi için kullanılamaz (kapsam: {category.AppliesTo}).");
        }

        // Görseller: id kütüphaneden doğrulanır, url sunucuda üretilir
        var image = await media.ResolveAsync(input.Image, "image", validator, ct);
        var gallery = await media.ResolveManyAsync(input.Gallery, "gallery", validator, ct);
        var ogImage = await media.ResolveAsync(input.OgImage, "ogImage", validator, ct);

        // Yayınlama kuralları
        if (input.IsActive)
        {
            if (input.Image is null)
                validator.AddError("image", "Yayınlamak için kapak görseli gerekli.");
            if (input.DefaultBasePrice <= 0)
                validator.AddError("defaultBasePrice", "Yayınlamak için fiyat 0'dan büyük olmalı.");
        }

        // Entity'ye uygula (kaydetme çağıranın işi, doğrulama geçtiyse)
        tour.CategoryId = input.CategoryId;
        tour.Title = input.Title ?? new();
        tour.Description = input.Description.OrNull();
        tour.LongDescription = html.Clean(input.LongDescription.OrNull());
        tour.Image = image;
        tour.Gallery = gallery;
        tour.Badge = input.Badge.OrNull();
        tour.BadgeTone = badgeTone;
        tour.Duration = duration;
        tour.Transport = input.Transport.OrNull();
        tour.TransportIcon = transportIcon;
        tour.Badges = input.Badges ?? [];
        tour.RoutePills = input.RoutePills ?? [];
        tour.QuickSpecs = input.QuickSpecs ?? [];
        tour.Editorial = editorial;
        tour.Itinerary = input.Itinerary ?? [];
        tour.Inclusions = inclusions;
        tour.TravelNotes = travelNotes;
        tour.SeatsTotal = input.SeatsTotal;
        tour.SeoTitle = input.SeoTitle.OrNull();
        tour.SeoDescription = input.SeoDescription.OrNull();
        tour.SeoKeywords = input.SeoKeywords.OrNull();
        tour.OgImage = ogImage;
        tour.DefaultBasePrice = input.DefaultBasePrice;
        tour.Currency = input.Currency ?? tour.Currency;
        tour.IsFeatured = input.IsFeatured;
        tour.IsActive = input.IsActive;
        tour.OrderIndex = input.OrderIndex;
    }

    // Liste elemanlarını tek tek kontrol eder (boyut sınırı + null öğe)
    private static void Each<T>(Validator v, string field, List<T>? items, int max, Action<T, string> check)
        where T : class
    {
        if (items is null) return;

        if (items.Count > max)
        {
            v.AddError(field, $"En fazla {max} öğe eklenebilir.");
            return;
        }

        for (var i = 0; i < items.Count; i++)
        {
            if (items[i] is null)
            {
                v.AddError($"{field}[{i}]", "Geçersiz öğe.");
                continue;
            }

            check(items[i], $"{field}[{i}]");
        }
    }

    private static Action<ListItem, string> CheckListItem(Validator v) =>
        (n, f) => v.MaxLength($"{f}.icon", n.Icon, 100).LocalizedRequired($"{f}.text", n.Text, 300);

    // Tamamen boş editoryal blok "verilmedi" sayılır, boş paragraf ve vurgular atılır
    private static EditorialBlock? NormalizeEditorial(EditorialBlock? block)
    {
        if (block is null) return null;

        var paragraphs = (block.Paragraphs ?? []).Where(p => !p.IsBlank()).ToList();
        var highlights = (block.Highlights ?? []).Where(h => !h.IsBlank()).ToList();

        var empty = block.Title.IsBlank() && block.Eyebrow.IsBlank()
                    && paragraphs.Count == 0 && highlights.Count == 0;

        return empty ? null : block with { Paragraphs = paragraphs, Highlights = highlights };
    }

    // Boş satırlar atılır, iki liste de boşsa blok "verilmedi" sayılır
    private static InclusionsBlock? NormalizeInclusions(InclusionsBlock? block)
    {
        if (block is null) return null;

        static bool Keep(ListItem? n) => n is not null && !(n.Text.IsBlank() && string.IsNullOrWhiteSpace(n.Icon));

        var included = (block.Included ?? []).Where(Keep).ToList();
        var excluded = (block.Excluded ?? []).Where(Keep).ToList();

        return included.Count == 0 && excluded.Count == 0
            ? null
            : new InclusionsBlock { Included = included!, Excluded = excluded! };
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static int Len(string? s) => s?.Length ?? 0;
}