using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.AccommodationTypes;

public record AccommodationTypeDto(
    Guid Id, string Key, LocalizedText Label, LocalizedText? Description,
    string? Icon, int OrderIndex, bool IsActive)
{
    public static AccommodationTypeDto From(AccommodationType t) =>
        new(t.Id, t.Key, t.Label, t.Description, t.Icon, t.OrderIndex, t.IsActive);
}