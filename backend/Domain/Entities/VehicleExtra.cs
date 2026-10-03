using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class VehicleExtra : BaseEntity
{
    public string Key { get; set; } = "";
    public string Icon { get; set; } = "";
    public LocalizedText Title { get; set; } = new();
    public LocalizedText Description { get; set; } = new();
    public LocalizedText? Tooltip { get; set; }
    public decimal DailyPrice { get; set; }
    public Currency Currency { get; set; } = Currency.TRY;
}