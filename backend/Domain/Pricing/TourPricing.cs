using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Pricing;

public enum PriceSource { Default, Rule, SessionOverride, Accommodation }

public record AdultPrice(decimal UnitPrice, PriceSource Source, LocalizedText? Label);

public record ChildLine(int Age, LocalizedText? Label, decimal UnitPrice, bool UsedAdultPrice);

public static class TourPricing
{
    // Günübirlik tur yetişkin fiyatı: seans özel fiyatı > tarihe uyan fiyat kuralı > varsayılan fiyat
    public static AdultPrice ResolveAdultPrice(
        DateOnly date, decimal? sessionOverride, IReadOnlyCollection<PriceRule> rules, decimal defaultPrice)
    {
        if (sessionOverride is { } overridePrice)
            return new AdultPrice(overridePrice, PriceSource.SessionOverride, null);

        var rule = PriceRuleResolver.Resolve(rules, date);

        return rule is null
            ? new AdultPrice(defaultPrice, PriceSource.Default, null)
            : new AdultPrice(rule.Price, PriceSource.Rule, rule.Label);
    }

    // Her çocuk için yaşına uyan aktif yaş kuralıyla fiyat hesaplar.
    // Uyan kural yoksa çocuk yetişkin fiyatını öder.
    public static List<ChildLine> PriceChildren(
        IEnumerable<int> ages, decimal adultUnitPrice, IReadOnlyCollection<AgePriceRule> rules)
    {
        var activeRules = rules.Where(r => r.IsActive).OrderBy(r => r.MinAge).ToList();
        var lines = new List<ChildLine>();

        foreach (var age in ages)
        {
            var rule = activeRules.FirstOrDefault(r => r.MinAge <= age && age <= r.MaxAge);

            if (rule is null)
            {
                lines.Add(new ChildLine(age, null, adultUnitPrice, true));
                continue;
            }

            var price = rule.Type switch
            {
                AgePriceType.Free => 0m,
                AgePriceType.Fixed => rule.Price ?? adultUnitPrice,
                AgePriceType.Percentage => Math.Round(
                    adultUnitPrice * (rule.Percentage ?? 100m) / 100m, 2, MidpointRounding.AwayFromZero),
                _ => adultUnitPrice
            };

            lines.Add(new ChildLine(age, rule.Label, price, false));
        }

        return lines;
    }
}