using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.BungalowRegions;

public record BungalowRegionDto(
    Guid Id, string Key, LocalizedText ShortLabel, LocalizedText FullLabel,
    MediaItem? Thumbnail, int OrderIndex, bool IsActive)
{
    public static BungalowRegionDto From(BungalowRegion r) =>
        new(r.Id, r.Key, r.ShortLabel, r.FullLabel, r.Thumbnail, r.OrderIndex, r.IsActive);
}