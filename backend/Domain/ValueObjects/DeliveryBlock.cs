namespace Rentravel.Domain.ValueObjects;

public sealed record DeliveryBlock
{
    public string Icon { get; init; } = "";
    public LocalizedText Label { get; init; } = new();
    public LocalizedText Title { get; init; } = new();
    public LocalizedText Description { get; init; } = new();
}