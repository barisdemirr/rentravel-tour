using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class BungalowExtra : BaseEntity
{
    public string Key { get; set; } = "";
    public string Icon { get; set; } = "";
    public LocalizedText Title { get; set; } = new();
    public LocalizedText Description { get; set; } = new();
    public LocalizedText? Tooltip { get; set; }

    // Fiyatlandırma: Once → adet × fiyat, Daily → gece × fiyat
    public ExtraChargeMode ChargeMode { get; set; } = ExtraChargeMode.Once;
    public decimal Price { get; set; }
    public Currency Currency { get; set; } = Currency.TRY;
}