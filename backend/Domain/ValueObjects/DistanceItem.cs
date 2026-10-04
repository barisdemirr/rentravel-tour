namespace Rentravel.Domain.ValueObjects;

public sealed record DistanceItem
{
    public LocalizedText Place { get; init; } = new();    // "Ayder Yaylası"
    public LocalizedText Value { get; init; } = new();    // "5 dk"
}