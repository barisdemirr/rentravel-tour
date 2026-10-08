using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.BungalowExtras;

public record BungalowExtraDto(
    Guid Id, string Key, string Icon, LocalizedText Title, LocalizedText Description,
    LocalizedText? Tooltip, ExtraChargeMode ChargeMode, decimal Price, Currency Currency,
    int OrderIndex, bool IsActive)
{
    public static BungalowExtraDto From(BungalowExtra e) =>
        new(e.Id, e.Key, e.Icon, e.Title, e.Description, e.Tooltip,
            e.ChargeMode, e.Price, e.Currency, e.OrderIndex, e.IsActive);
}