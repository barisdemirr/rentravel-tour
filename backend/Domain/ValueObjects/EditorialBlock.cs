namespace Rentravel.Domain.ValueObjects;

public sealed record EditorialBlock
{
    public LocalizedText? Eyebrow { get; init; }
    public string? EyebrowIcon { get; init; }
    public LocalizedText Title { get; init; } = new();
    public List<LocalizedText> Paragraphs { get; init; } = [];
    public List<LocalizedText> Highlights { get; init; } = [];
}