namespace Rentravel.Domain.ValueObjects;

public sealed record ListItem
{
    public string? Icon { get; init; }
    public LocalizedText Text { get; init; } = new();
}