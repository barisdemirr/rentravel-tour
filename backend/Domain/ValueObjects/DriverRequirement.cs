namespace Rentravel.Domain.ValueObjects;

public sealed record DriverRequirement
{
    public LocalizedText Label { get; init; } = new();
    public LocalizedText Value { get; init; } = new();
    public LocalizedText? Sub { get; init; }
    public bool Highlight { get; init; }
}