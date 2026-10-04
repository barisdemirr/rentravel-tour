namespace Rentravel.Domain.ValueObjects;

public sealed record BadgeItem
{
    public string Icon { get; init; } = "";
    public LocalizedText Label { get; init; } = new();
    public string Tone { get; init; } = "";
}