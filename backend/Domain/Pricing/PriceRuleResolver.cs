using Rentravel.Domain.Entities;

namespace Rentravel.Domain.Pricing;

public static class PriceRuleResolver
{
    // Verilen gün için kazanan kural: aktif ve tarih aralığına uyanlar arasından en yüksek Priority,
    // eşitse en son eklenen. Hiçbiri uymazsa null (çağıran varsayılan fiyatı kullanır).
    public static PriceRule? Resolve(IEnumerable<PriceRule> rules, DateOnly date) =>
        rules
            .Where(r => r.IsActive && r.StartDate <= date && date <= r.EndDate)
            .OrderByDescending(r => r.Priority)
            .ThenByDescending(r => r.CreatedAt)
            .FirstOrDefault();
}