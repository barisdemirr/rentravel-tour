using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.PriceRules;

public record PriceRuleDto(
    Guid Id, PriceOwnerType OwnerType, Guid OwnerId,
    DateOnly StartDate, DateOnly EndDate, decimal Price, int Priority,
    LocalizedText? Label, bool IsActive, DateTime CreatedAt)
{
    public static PriceRuleDto From(PriceRule r) =>
        new(r.Id, r.OwnerType, r.OwnerId, r.StartDate, r.EndDate, r.Price, r.Priority,
            r.Label, r.IsActive, r.CreatedAt);
}