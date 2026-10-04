namespace Rentravel.Domain.ValueObjects;

public sealed record FeatureItem
{
    public string Icon { get; init; } = "";
    public LocalizedText Label { get; init; } = new();
    public LocalizedText? Sub { get; init; }
    public string? Tone { get; init; }
}