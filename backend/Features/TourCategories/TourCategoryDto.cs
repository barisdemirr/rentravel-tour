using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.TourCategories;

public record TourCategoryDto(
    Guid Id, string Key, LocalizedText Label, string Icon,
    TourCategoryScope AppliesTo, int OrderIndex, bool IsActive)
{
    public static TourCategoryDto From(TourCategory c) =>
        new(c.Id, c.Key, c.Label, c.Icon, c.AppliesTo, c.OrderIndex, c.IsActive);
}