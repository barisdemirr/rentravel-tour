using Microsoft.EntityFrameworkCore;
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

        // Sonraki aşamalar: Vehicles, DailyTours, CultureTours, Bungalows (Image, Gallery, OgImage...)
        // Zengin metin içine gömülü görseller (StaticPages, LongDescription) URL'den taranacak.

        return usages;
    }
}