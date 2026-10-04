namespace Rentravel.Domain.ValueObjects;

public sealed record ItineraryItem
{
    public string Icon { get; init; } = "";
    public string Time { get; init; } = "";          // "09:30"
    public LocalizedText Title { get; init; } = new();
    public LocalizedText? Description { get; init; }
    public bool IsFinal { get; init; }
}