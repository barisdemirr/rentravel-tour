using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;

namespace Rentravel.Infrastructure.Services;

public class MediaUsageChecker(AppDbContext db)
{
    // Görselin kullanıldığı yerleri okunabilir metin olarak döndürür.
    // Yeni MediaItem içeren her entity eklendiğinde buraya bir sorgu eklenir.
    public async Task<List<string>> FindUsagesAsync(Guid mediaId, CancellationToken ct)
    {
        var usages = new List<string>();

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

        // Sonraki: Bungalows (aşağıda eklenecek), StaticPages.
        // Zengin metin içine gömülü görseller (LongDescription, StaticPages) URL'den taranacak.

        return usages;
    }

    private static bool Uses(Guid id, MediaItem? image, IEnumerable<MediaItem>? gallery, MediaItem? ogImage) =>
        image?.Id == id || ogImage?.Id == id || (gallery?.Any(m => m.Id == id) ?? false);
}