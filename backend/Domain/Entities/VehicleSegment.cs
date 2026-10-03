using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class VehicleSegment : BaseEntity
{
    public string Key { get; set; } = "";
    public LocalizedText Label { get; set; } = new();
    public string Icon { get; set; } = "";
}