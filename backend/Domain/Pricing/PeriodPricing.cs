using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Pricing;

// Art arda aynı kuralla fiyatlanan dönemlerin (gün/gece) tek satırı
public record PriceLine(
    DateOnly From, DateOnly To, int Periods, decimal UnitPrice, decimal Subtotal,
    LocalizedText? Label, bool IsDefault);

public static class PeriodPricing
{
    // Başlangıç ve bitiş arasındaki 24 saatlik dilim sayısı. Kısmi dilim yukarı yuvarlanır.
    // Bitiş başlangıçtan sonra değilse 0 döner.
    public static int CountPeriods(DateTime start, DateTime end)
    {
        var ticks = (end - start).Ticks;
        if (ticks <= 0) return 0;

        return (int)((ticks + TimeSpan.TicksPerDay - 1) / TimeSpan.TicksPerDay);
    }

    // Her dilim, başladığı tarihe uyan kuralla fiyatlanır. Kural yoksa varsayılan fiyat kullanılır.
    // Aynı kuralla fiyatlanan art arda dilimler tek satırda birleşir.
    public static List<PriceLine> BuildLines(
        DateOnly firstDay, int periods, decimal defaultPrice, IReadOnlyCollection<PriceRule> rules)
    {
        var lines = new List<PriceLine>();
        Guid? lastRuleId = null;

        for (var i = 0; i < periods; i++)
        {
            var date = firstDay.AddDays(i);
            var rule = PriceRuleResolver.Resolve(rules, date);
            var unit = rule?.Price ?? defaultPrice;
            Guid? ruleId = rule?.Id;

            if (lines.Count > 0 && ruleId == lastRuleId)
            {
                var last = lines[^1];
                lines[^1] = last with { To = date, Periods = last.Periods + 1, Subtotal = last.Subtotal + unit };
            }
            else
            {
                lines.Add(new PriceLine(date, date, 1, unit, unit, rule?.Label, rule is null));
                lastRuleId = ruleId;
            }
        }

        return lines;
    }
}