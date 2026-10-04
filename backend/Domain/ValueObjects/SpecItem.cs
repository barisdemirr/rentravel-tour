namespace Rentravel.Domain.ValueObjects;

public sealed record SpecItem
{
    public string Icon { get; init; } = "";
    public LocalizedText Label { get; init; } = new();
    public LocalizedText Value { get; init; } = new();
}