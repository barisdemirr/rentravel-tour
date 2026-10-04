using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;

namespace Rentravel.Infrastructure.Services;

public class MediaUsageChecker(AppDbContext db)
{
    // Görselin kullanıldığı yerleri okunabilir metin olarak döndürür.
    // Yeni MediaItem veya HTML alanı içeren her entity eklendiğinde buraya bir sorgu eklenir.
    public async Task<List<string>> FindUsagesAsync(Guid mediaId, CancellationToken ct)
    {
        var usages = new List<string>();

        // ---- MediaItem alanları (kapak, galeri, OgImage...) ----

        var regions = await db.BungalowRegions.AsNoTracking()
            .Select(x => new { x.Key, x.Thumbnail })
            .ToListAsync(ct);

        usages.AddRange(regions
            .Where(x => x.Thumbnail?.Id == mediaId)
            .Select(x => $"Bungalov bölgesi: {x.Key}"));

        var vehicles = await db.Vehicles.AsNoTracking()
            .Select(x => new { x.Slug, x.Image, x.Gallery, x.OgImage })
            .ToListAsync(ct);

        usages.AddRange(vehicles
            .Where(x => Uses(mediaId, x.Image, x.Gallery, x.OgImage))
            .Select(x => $"Araç: {x.Slug}"));

        var dailyTours = await db.DailyTours.AsNoTracking()
            .Select(x => new { x.Slug, x.Image, x.Gallery, x.OgImage })
            .ToListAsync(ct);

        usages.AddRange(dailyTours
            .Where(x => Uses(mediaId, x.Image, x.Gallery, x.OgImage))
            .Select(x => $"Günübirlik tur: {x.Slug}"));

        var cultureTours = await db.CultureTours.AsNoTracking()
            .Select(x => new { x.Slug, x.Image, x.Gallery, x.OgImage })
            .ToListAsync(ct);

        usages.AddRange(cultureTours
            .Where(x => Uses(mediaId, x.Image, x.Gallery, x.OgImage))
            .Select(x => $"Kültür turu: {x.Slug}"));

        var bungalows = await db.Bungalows.AsNoTracking()
            .Select(x => new { x.Slug, x.Image, x.Gallery, x.OgImage, x.BreakfastCard })
            .ToListAsync(ct);

        usages.AddRange(bungalows
            .Where(x => Uses(mediaId, x.Image, x.Gallery, x.OgImage) || x.BreakfastCard?.Image?.Id == mediaId)
            .Select(x => $"Bungalov: {x.Slug}"));

        // ---- Zengin metin içine gömülü görseller (URL'den aranır) ----

        var asset = await db.MediaAssets.AsNoTracking().FirstOrDefaultAsync(x => x.Id == mediaId, ct);
        if (asset is null) return usages;

        // /uploads/2026/10/abc.jpg -> /uploads/2026/10/abc (orijinal ve tüm varyantlar aynı kökü paylaşır)
        var stem = asset.FilePath[..asset.FilePath.LastIndexOf('.')];

        var pages = await db.StaticPages.AsNoTracking()
            .Select(x => new { x.Slug, x.Content })
            .ToListAsync(ct);

        usages.AddRange(pages
            .Where(x => Mentions(x.Content, stem))
            .Select(x => $"Sabit sayfa içeriği: {x.Slug}"));

        var vehicleTexts = await db.Vehicles.AsNoTracking()
            .Select(x => new { x.Slug, x.Description })
            .ToListAsync(ct);

        usages.AddRange(vehicleTexts
            .Where(x => Mentions(x.Description, stem))
            .Select(x => $"Araç açıklaması: {x.Slug}"));

        var dailyTexts = await db.DailyTours.AsNoTracking()
            .Select(x => new { x.Slug, x.LongDescription })
            .ToListAsync(ct);

        usages.AddRange(dailyTexts
            .Where(x => Mentions(x.LongDescription, stem))
            .Select(x => $"Günübirlik tur açıklaması: {x.Slug}"));

        var cultureTexts = await db.CultureTours.AsNoTracking()
            .Select(x => new { x.Slug, x.LongDescription })
            .ToListAsync(ct);

        usages.AddRange(cultureTexts
            .Where(x => Mentions(x.LongDescription, stem))
            .Select(x => $"Kültür turu açıklaması: {x.Slug}"));

        var bungalowTexts = await db.Bungalows.AsNoTracking()
            .Select(x => new { x.Slug, x.LongDescription })
            .ToListAsync(ct);

        usages.AddRange(bungalowTexts
            .Where(x => Mentions(x.LongDescription, stem))
            .Select(x => $"Bungalov açıklaması: {x.Slug}"));

        return usages;
    }

    private static bool Uses(Guid id, MediaItem? image, IEnumerable<MediaItem>? gallery, MediaItem? ogImage) =>
        image?.Id == id || ogImage?.Id == id || (gallery?.Any(m => m.Id == id) ?? false);

    private static bool Mentions(LocalizedHtml? html, string stem) =>
        html is not null && (Has(html.Tr, stem) || Has(html.En, stem) || Has(html.Ar, stem));

    private static bool Has(string? text, string stem) =>
        !string.IsNullOrEmpty(text) && text.Contains(stem, StringComparison.OrdinalIgnoreCase);
}