using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

// Create ve Update'in ortak kaydetme mantığı: doğrulama, görsel çözümleme, ekstra kopyalama, slug.
public class VehicleSaveHandler(AppDbContext db, MediaItemResolver media, HtmlCleaner html)
{
    private static readonly string[] BadgeTones = ["primary", "dark", "vivid", "surface"];

    public async Task<Result<VehicleDto>> Save(Vehicle? existing, VehicleInput input, CancellationToken ct)
    {
        var badgeTone = string.IsNullOrWhiteSpace(input.BadgeTone) ? null : input.BadgeTone.Trim().ToLowerInvariant();
        var rating = string.IsNullOrWhiteSpace(input.Rating) ? null : input.Rating.Trim();

        var validator = new Validator()
            .LocalizedRequired("name", input.Name, 150)
            .LocalizedOptional("tagline", input.Tagline, 200)
            .LocalizedOptional("badge", input.Badge, 60)
            .LocalizedOptional("guarantee", input.Guarantee, 200)
            .LocalizedOptional("seoTitle", input.SeoTitle, 120)
            .LocalizedOptional("seoDescription", input.SeoDescription, 300)
            .LocalizedOptional("seoKeywords", input.SeoKeywords, 300)
            .MaxLength("rating", rating, 20)
            .Must("badgeTone", badgeTone is null || BadgeTones.Contains(badgeTone),
                  "badgeTone geçersiz (primary, dark, vivid, surface).")
            .Must("description",
                  input.Description is null || (Len(input.Description.Tr) <= 20000
                      && Len(input.Description.En) <= 20000 && Len(input.Description.Ar) <= 20000),
                  "description her dilde en fazla 20000 karakter olabilir.")
            .Must("deposit", input.Deposit >= 0, "deposit negatif olamaz.")
            .Must("kmLimit", input.KmLimit is null or > 0, "kmLimit boş (sınırsız) veya 0'dan büyük olmalı.")
            .Must("extraKmPrice", input.ExtraKmPrice is null or >= 0, "extraKmPrice negatif olamaz.")
            .Must("defaultDailyPrice", input.DefaultDailyPrice >= 0, "defaultDailyPrice negatif olamaz.")
            .Must("currency", input.Currency is { } c && Enum.IsDefined(c),
                  "currency zorunlu ve geçerli olmalı (TRY, USD, EUR).");

        ValidateSpecs(validator, "specs", input.Specs);
        ValidateSpecs(validator, "detailedSpecs", input.DetailedSpecs);
        ValidateDelivery(validator, "delivery", input.Delivery);
        ValidateDelivery(validator, "office", input.Office);
        ValidateDriverRequirements(validator, input.DriverRequirements);

        if (input.SegmentId is { } segmentId && !await db.VehicleSegments.AnyAsync(x => x.Id == segmentId, ct))
            validator.AddError("segmentId", "Segment bulunamadı.");

        // Görseller: id kütüphaneden doğrulanır, url sunucuda üretilir
        var image = await media.ResolveAsync(input.Image, "image", validator, ct);
        var gallery = await media.ResolveManyAsync(input.Gallery, "gallery", validator, ct);
        var ogImage = await media.ResolveAsync(input.OgImage, "ogImage", validator, ct);

        // Ekstralar: mevcut kopyalar korunur, yeniler katalogdan kopyalanır
        var extras = await BuildExtras(existing?.Extras, input.ExtraIds, input.Currency, validator, ct);

        // Yayınlama kuralları
        if (input.IsActive)
        {
            if (input.Image is null)
                validator.AddError("image", "Yayınlamak için kapak görseli gerekli.");
            if (input.DefaultDailyPrice <= 0)
                validator.AddError("defaultDailyPrice", "Yayınlamak için günlük fiyat 0'dan büyük olmalı.");
        }

        // Slug
        var explicitSlug = input.Slug?.Trim().ToLowerInvariant();
        var hasExplicitSlug = !string.IsNullOrWhiteSpace(explicitSlug);
        string? slug = null;

        if (hasExplicitSlug)
        {
            if (explicitSlug!.Length > 100 || !SlugHelper.IsValid(explicitSlug))
                validator.AddError("slug",
                    "slug sadece küçük harf, rakam ve tire içerebilir (örn: dacia-sandero-stepway), en fazla 100 karakter.");
            else
                slug = explicitSlug;
        }
        else if (existing is not null)
        {
            slug = existing.Slug; // boş bırakılırsa mevcut slug korunur
        }
        else
        {
            var generated = SlugHelper.From(input.Name?.Tr);
            if (generated.Length == 0)
                validator.AddError("slug", "Slug isimden üretilemedi, elle girin.");
            else
                slug = generated;
        }

        if (!validator.IsValid) return validator.ToFailure<VehicleDto>();

        if (hasExplicitSlug)
        {
            if (await db.Vehicles.AnyAsync(x => x.Slug == slug && x.Id != (existing == null ? Guid.Empty : existing.Id), ct))
                return Result<VehicleDto>.Fail(Error.Conflict($"'{slug}' adresi zaten kullanılıyor."));
        }
        else if (existing is null)
        {
            slug = await MakeUniqueSlug(slug!, ct); // otomatik üretilen: -2, -3...
        }

        var vehicle = existing ?? new Vehicle();

        vehicle.Slug = slug!;
        vehicle.SegmentId = input.SegmentId;
        vehicle.Name = input.Name!;
        vehicle.Tagline = input.Tagline.OrNull();
        vehicle.Description = html.Clean(input.Description.OrNull());
        vehicle.Image = image;
        vehicle.Gallery = gallery;
        vehicle.Badge = input.Badge.OrNull();
        vehicle.BadgeTone = badgeTone;
        vehicle.Rating = rating;
        vehicle.Guarantee = input.Guarantee.OrNull();
        vehicle.Specs = input.Specs ?? [];
        vehicle.DetailedSpecs = input.DetailedSpecs ?? [];
        vehicle.Delivery = NormalizeDelivery(input.Delivery);
        vehicle.Office = NormalizeDelivery(input.Office);
        vehicle.DriverRequirements = input.DriverRequirements ?? [];
        vehicle.Deposit = input.Deposit;
        vehicle.KmLimit = input.KmLimit;
        vehicle.ExtraKmPrice = input.ExtraKmPrice;
        vehicle.Extras = extras;
        vehicle.SeoTitle = input.SeoTitle.OrNull();
        vehicle.SeoDescription = input.SeoDescription.OrNull();
        vehicle.SeoKeywords = input.SeoKeywords.OrNull();
        vehicle.OgImage = ogImage;
        vehicle.DefaultDailyPrice = input.DefaultDailyPrice;
        vehicle.Currency = input.Currency!.Value;
        vehicle.IsFeatured = input.IsFeatured;
        vehicle.IsActive = input.IsActive;
        vehicle.OrderIndex = input.OrderIndex;

        if (existing is null) db.Vehicles.Add(vehicle);
        await db.SaveChangesAsync(ct);

        // Segment bilgisiyle birlikte yeniden oku (silinmiş segment null görünür)
        var saved = await db.Vehicles.AsNoTracking()
            .Include(x => x.Segment)
            .FirstAsync(x => x.Id == vehicle.Id, ct);

        return Result<VehicleDto>.Success(VehicleDto.From(saved));
    }

    private async Task<List<VehicleExtraSnapshot>> BuildExtras(
        List<VehicleExtraSnapshot>? current, List<Guid>? ids, Currency? currency,
        Validator validator, CancellationToken ct)
    {
        var result = new List<VehicleExtraSnapshot>();
        if (ids is null || ids.Count == 0) return result;

        if (ids.Count > 20)
        {
            validator.AddError("extraIds", "En fazla 20 ekstra eklenebilir.");
            return result;
        }

        if (ids.Count != ids.Distinct().Count())
        {
            validator.AddError("extraIds", "Aynı ekstra birden fazla kez eklenemez.");
            return result;
        }

        var kept = (current ?? []).ToDictionary(x => x.ExtraId);
        var newIds = ids.Where(id => !kept.ContainsKey(id)).ToList();

        var catalog = await db.VehicleExtras.AsNoTracking()
            .Where(x => x.IsActive && newIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, ct);

        for (var i = 0; i < ids.Count; i++)
        {
            VehicleExtraSnapshot snapshot;

            if (kept.TryGetValue(ids[i], out var existingSnapshot))
                snapshot = existingSnapshot; // araca daha önce eklenmiş: kopya aynen korunur
            else if (catalog.TryGetValue(ids[i], out var extra))
                snapshot = VehicleExtraSnapshot.From(extra); // yeni: katalogdan kopyala
            else
            {
                validator.AddError($"extraIds[{i}]", "Ekstra bulunamadı veya pasif.");
                continue;
            }

            if (currency is { } cur && snapshot.Currency != cur)
                validator.AddError($"extraIds[{i}]",
                    $"'{snapshot.Key}' ekstrasının para birimi ({snapshot.Currency}) araçla ({cur}) aynı olmalı.");

            result.Add(snapshot);
        }

        return result;
    }

    private async Task<string> MakeUniqueSlug(string baseSlug, CancellationToken ct)
    {
        var candidate = baseSlug;
        var n = 2;
        while (await db.Vehicles.AnyAsync(x => x.Slug == candidate, ct))
            candidate = $"{baseSlug}-{n++}";
        return candidate;
    }

    private static void ValidateSpecs(Validator v, string field, List<SpecItem>? items)
    {
        if (items is null) return;

        if (items.Count > 20)
        {
            v.AddError(field, "En fazla 20 özellik eklenebilir.");
            return;
        }

        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            if (item is null)
            {
                v.AddError($"{field}[{i}]", "Geçersiz öğe.");
                continue;
            }

            v.MaxLength($"{field}[{i}].icon", item.Icon, 100)
                .LocalizedRequired($"{field}[{i}].label", item.Label, 100)
                .LocalizedRequired($"{field}[{i}].value", item.Value, 150);
        }
    }

    private static void ValidateDelivery(Validator v, string field, DeliveryBlock? block)
    {
        if (block is null) return;

        v.MaxLength($"{field}.icon", block.Icon, 100)
            .LocalizedOptional($"{field}.label", block.Label, 100)
            .LocalizedOptional($"{field}.title", block.Title, 150)
            .LocalizedOptional($"{field}.description", block.Description, 500);
    }

    private static void ValidateDriverRequirements(Validator v, List<DriverRequirement>? items)
    {
        if (items is null) return;

        if (items.Count > 12)
        {
            v.AddError("driverRequirements", "En fazla 12 gereksinim eklenebilir.");
            return;
        }

        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            if (item is null)
            {
                v.AddError($"driverRequirements[{i}]", "Geçersiz öğe.");
                continue;
            }

            v.LocalizedRequired($"driverRequirements[{i}].label", item.Label, 100)
                .LocalizedRequired($"driverRequirements[{i}].value", item.Value, 100)
                .LocalizedOptional($"driverRequirements[{i}].sub", item.Sub, 200);
        }
    }

    // Tamamen boş gelen blok "verilmedi" sayılır
    private static DeliveryBlock? NormalizeDelivery(DeliveryBlock? block)
    {
        if (block is null) return null;

        var empty = string.IsNullOrWhiteSpace(block.Icon)
                    && block.Label.IsBlank() && block.Title.IsBlank() && block.Description.IsBlank();

        return empty ? null : block;
    }

    private static int Len(string? s) => s?.Length ?? 0;
}