namespace Rentravel.Domain.ValueObjects;

public sealed record RuleItem
{
    public string Icon { get; init; } = "";
    public LocalizedText Title { get; init; } = new();
    public LocalizedText? Text { get; init; }
}