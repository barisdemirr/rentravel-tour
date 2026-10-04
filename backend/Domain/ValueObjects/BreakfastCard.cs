namespace Rentravel.Domain.ValueObjects;

public sealed record BreakfastCard
{
    public LocalizedText Title { get; init; } = new();
    public MediaItem? Image { get; init; }
    public LocalizedText? Description { get; init; }
    public List<LocalizedText> Tags { get; init; } = [];
}