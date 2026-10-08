using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Pricing;

public record BungalowChildLine(int Age, LocalizedText? Label, decimal NightlyCharge, int Nights, decimal Total);

// Standart kapasiteyi aşan yetişkinler için tek satır
public record BungalowExtraAdultLine(int Count, decimal NightlyCharge, int Nights, decimal Total);

// Rezervasyona seçilen ekstra hizmetlerin tek satırı
//   Once  → Count × UnitPrice
//   Daily → UnitPrice × Nights
public record BungalowExtraLine(
    Guid ExtraId, string Key, LocalizedText Title, ExtraChargeMode ChargeMode,
    int Count, decimal UnitPrice, int Nights, decimal Subtotal);

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

    // Standart kapasiteyi aşan her yetişkin için sabit gecelik ek ücret.
    // extraAdultPrice <= 0 ise ya da yetişkin sayısı standart kapasiteyi aşmıyorsa null döner.
    public static BungalowExtraAdultLine? PriceExtraAdults(
        int adults, int standardCapacity, int nights, decimal extraAdultPrice)
    {
        if (extraAdultPrice <= 0 || adults <= standardCapacity) return null;

        var extraCount = adults - standardCapacity;
        var total = extraAdultPrice * nights * extraCount;
        return new BungalowExtraAdultLine(extraCount, extraAdultPrice, nights, total);
    }



    // Bir bungalova seçilen ekstraların satırlarını üretir.
    //   Once  → Count × UnitPrice (Count kullanıcı seçimi; 0 ise satır yok)
    //   Daily → UnitPrice × Nights   (Count her zaman 1; adet seçilemez)
    public static List<BungalowExtraLine> PriceExtras(
        IEnumerable<(BungalowExtraSnapshot Extra, int Count)> selections, int nights)
    {
        var lines = new List<BungalowExtraLine>();

        foreach (var (extra, count) in selections)
        {
            if (extra.ChargeMode == ExtraChargeMode.Daily)
            {
                // Daily: adet her zaman 1, fiyat = gecelik × gece
                lines.Add(new BungalowExtraLine(
                    extra.ExtraId, extra.Key, extra.Title, extra.ChargeMode,
                    Count: 1, UnitPrice: extra.Price, Nights: nights,
                    Subtotal: extra.Price * nights));
            }
            else
            {
                // Once: adet 0 ise satır üretilmez
                if (count <= 0) continue;

                lines.Add(new BungalowExtraLine(
                    extra.ExtraId, extra.Key, extra.Title, extra.ChargeMode,
                    Count: count, UnitPrice: extra.Price, Nights: nights,
                    Subtotal: extra.Price * count));
            }
        }

        return lines;
    }
}