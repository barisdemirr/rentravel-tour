using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Pricing;

public record BungalowChildLine(int Age, LocalizedText? Label, decimal NightlyCharge, int Nights, decimal Total);

public static class BungalowPricing
{
    // Çocuk başı gecelik ek ücret: yaşa uyan Fixed kuralın tutarı. Free veya kural yoksa ek ücret yok.
    public static List<BungalowChildLine> PriceChildren(
        IEnumerable<int> ages, int nights, IReadOnlyCollection<AgePriceRule> rules)
    {
        var activeRules = rules.Where(r => r.IsActive).OrderBy(r => r.MinAge).ToList();
        var lines = new List<BungalowChildLine>();

        foreach (var age in ages)
        {
            var rule = activeRules.FirstOrDefault(r => r.MinAge <= age && age <= r.MaxAge);
            var nightly = rule is { Type: AgePriceType.Fixed } ? rule.Price ?? 0m : 0m;

            lines.Add(new BungalowChildLine(age, rule?.Label, nightly, nights, nightly * nights));
        }

        return lines;
    }
}