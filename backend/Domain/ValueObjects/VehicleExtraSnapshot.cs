using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;

namespace Rentravel.Domain.ValueObjects;

// Katalogdaki VehicleExtra'nın araca eklendiği andaki kopyası
public sealed record VehicleExtraSnapshot
{
    public Guid ExtraId { get; init; }          // katalog kaydı (eşleştirme için)
    public string Key { get; init; } = "";
    public string Icon { get; init; } = "";
    public LocalizedText Title { get; init; } = new();
    public LocalizedText Description { get; init; } = new();
    public LocalizedText? Tooltip { get; init; }
    public decimal DailyPrice { get; init; }
    public Currency Currency { get; init; }

    public static VehicleExtraSnapshot From(VehicleExtra e) => new()
    {
        ExtraId = e.Id,
        Key = e.Key,
        Icon = e.Icon,
        Title = e.Title,
        Description = e.Description,
        Tooltip = e.Tooltip,
        DailyPrice = e.DailyPrice,
        Currency = e.Currency
    };
}