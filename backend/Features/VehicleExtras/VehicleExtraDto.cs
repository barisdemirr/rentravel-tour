using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.VehicleExtras;

public record VehicleExtraDto(
    Guid Id, string Key, string Icon, LocalizedText Title, LocalizedText Description,
    LocalizedText? Tooltip, decimal DailyPrice, Currency Currency, int OrderIndex, bool IsActive)
{
    public static VehicleExtraDto From(VehicleExtra e) =>
        new(e.Id, e.Key, e.Icon, e.Title, e.Description, e.Tooltip,
            e.DailyPrice, e.Currency, e.OrderIndex, e.IsActive);
}