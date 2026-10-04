using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.AgePriceRules;

public record AgePriceRuleDto(
    Guid Id, PriceOwnerType OwnerType, Guid OwnerId,
    int MinAge, int MaxAge, AgePriceType Type, decimal? Price, decimal? Percentage,
    LocalizedText Label, bool IsActive, DateTime CreatedAt)
{
    public static AgePriceRuleDto From(AgePriceRule r) =>
        new(r.Id, r.OwnerType, r.OwnerId, r.MinAge, r.MaxAge, r.Type, r.Price, r.Percentage,
            r.Label, r.IsActive, r.CreatedAt);
}