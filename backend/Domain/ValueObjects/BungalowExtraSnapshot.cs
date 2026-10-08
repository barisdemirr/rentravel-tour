using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;

namespace Rentravel.Domain.ValueObjects;

// Katalogdaki BungalowExtra'nın bungalova eklendiği andaki kopyası
public sealed record BungalowExtraSnapshot
{
    public Guid ExtraId { get; init; }
    public string Key { get; init; } = "";
    public string Icon { get; init; } = "";
    public LocalizedText Title { get; init; } = new();
    public LocalizedText Description { get; init; } = new();
    public LocalizedText? Tooltip { get; init; }
    public ExtraChargeMode ChargeMode { get; init; }
    public decimal Price { get; init; }
    public Currency Currency { get; init; }

    public static BungalowExtraSnapshot From(BungalowExtra e) => new()
    {
        ExtraId = e.Id,
        Key = e.Key,
        Icon = e.Icon,
        Title = e.Title,
        Description = e.Description,
        Tooltip = e.Tooltip,
        ChargeMode = e.ChargeMode,
        Price = e.Price,
        Currency = e.Currency
    };
}