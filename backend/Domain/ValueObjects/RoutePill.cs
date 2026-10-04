namespace Rentravel.Domain.ValueObjects;

public sealed record RoutePill
{
    public LocalizedText Label { get; init; } = new();
    public string? Icon { get; init; }
    public bool Highlight { get; init; }
}