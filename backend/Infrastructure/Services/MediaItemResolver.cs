using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Infrastructure.Services;

// Admin'den gelen MediaItem'ları kütüphaneye göre doğrular ve normalize eder:
// url sunucudan üretilir, sıra dizideki konumdan belirlenir.
public class MediaItemResolver(AppDbContext db)
{
    public const int MaxGalleryItems = 30;

    // Tek görsel: kapak, OgImage, bölge thumbnail'i...
    public async Task<MediaItem?> ResolveAsync(MediaItem? input, string field, Validator validator, CancellationToken ct)
    {
        if (input is null) return null;

        var assets = await LoadAssetsAsync([input.Id], ct);
        if (!assets.TryGetValue(input.Id, out var asset))
        {
            validator.AddError($"{field}.id", "Görsel bulunamadı veya silinmiş.");
            return null;
        }

        return Build(asset, input, 0);
    }

    // Galeri: en fazla 30 görsel, tekrar yok, sıra = dizideki konum
    public async Task<List<MediaItem>> ResolveManyAsync(
        IReadOnlyList<MediaItem>? input, string field, Validator validator, CancellationToken ct)
    {
        var result = new List<MediaItem>();
        if (input is null || input.Count == 0) return result;

        if (input.Count > MaxGalleryItems)
        {
            validator.AddError(field, $"En fazla {MaxGalleryItems} görsel eklenebilir.");
            return result;
        }

        if (input.Any(x => x is null))
        {
            validator.AddError(field, "Görsel listesi geçersiz öğe içeriyor.");
            return result;
        }

        var ids = input.Select(x => x.Id).Distinct().ToList();
        if (ids.Count != input.Count)
        {
            validator.AddError(field, "Aynı görsel birden fazla kez eklenemez.");
            return result;
        }

        var assets = await LoadAssetsAsync(ids, ct);

        for (var i = 0; i < input.Count; i++)
        {
            if (!assets.TryGetValue(input[i].Id, out var asset))
            {
                validator.AddError($"{field}[{i}].id", "Görsel bulunamadı veya silinmiş.");
                continue;
            }

            result.Add(Build(asset, input[i], i));
        }

        return result;
    }

    private async Task<Dictionary<Guid, MediaAsset>> LoadAssetsAsync(List<Guid> ids, CancellationToken ct) =>
        await db.MediaAssets
            .AsNoTracking()
            .Where(x => x.IsActive && ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, ct);

    private static MediaItem Build(MediaAsset asset, MediaItem input, int order) => new()
    {
        Id = asset.Id,
        Url = ImageService.VariantPath(asset.FilePath, "lg"),
        // Kullanım yerine özel alt metin geldiyse onu kullan, yoksa kütüphanedeki alt metin
        Alt = input.Alt is not null && !string.IsNullOrWhiteSpace(input.Alt.Tr) ? input.Alt : asset.AltText,
        Order = order
    };
}