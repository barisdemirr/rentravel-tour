using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.VehicleSegments;

public record VehicleSegmentDto(Guid Id, string Key, LocalizedText Label, string Icon, int OrderIndex, bool IsActive)
{
    public static VehicleSegmentDto From(VehicleSegment s) =>
        new(s.Id, s.Key, s.Label, s.Icon, s.OrderIndex, s.IsActive);
}