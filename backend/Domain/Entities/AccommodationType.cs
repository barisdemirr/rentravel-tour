using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class AccommodationType : BaseEntity
{
    public string Key { get; set; } = "";
    public LocalizedText Label { get; set; } = new();
    public LocalizedText? Description { get; set; }
    public string? Icon { get; set; }
}