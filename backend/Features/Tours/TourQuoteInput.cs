using Rentravel.Shared;

namespace Rentravel.Features.Tours;

public record TourQuoteInput
{
    public DateOnly? Date { get; init; }
    public int Adults { get; init; }
    public List<int>? ChildAges { get; init; }
}

public static class TourQuoteValidation
{
    public const int MaxAdults = 50;
    public const int MaxChildren = 20;

    public static Validator Validate(Validator v, TourQuoteInput input)
    {
        v.Must("date", input.Date is not null, "date zorunludur.")
         .Must("date", input.Date is null || input.Date >= TurkeyClock.Today, "Tarih geçmişte olamaz.")
         .Must("adults", input.Adults is >= 1 and <= MaxAdults, $"adults 1 ile {MaxAdults} arasında olmalı.");

        var ages = input.ChildAges ?? [];

        if (ages.Count > MaxChildren)
        {
            v.AddError("childAges", $"En fazla {MaxChildren} çocuk eklenebilir.");
            return v;
        }

        for (var i = 0; i < ages.Count; i++)
        {
            if (ages[i] is < 0 or > 17)
                v.AddError($"childAges[{i}]", "Çocuk yaşı 0 ile 17 arasında olmalı (18 ve üzeri yetişkin sayılır).");
        }

        return v;
    }
}