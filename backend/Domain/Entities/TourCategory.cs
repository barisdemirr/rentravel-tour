using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class TourCategory : BaseEntity
{
    public string Key { get; set; } = "";
    public LocalizedText Label { get; set; } = new();
    public string Icon { get; set; } = "";
    public TourCategoryScope AppliesTo { get; set; } = TourCategoryScope.Both;
}