using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.Pricing;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public static class QuoteBungalow
{
    private const int MaxNights = 90;
    private const int MaxAdults = 20;
    private const int MaxChildren = 20;
    private const int MaxExtras = 20;

    // extraIds: sadece bungalovda tanımlı ekstra ID'leri
    // extraCounts: Once mode'da adet, Daily mode'da yok sayılır (her zaman 1)
    public record Command(
        DateOnly? CheckInDate, DateOnly? CheckOutDate,
        int Adults, List<int>? ChildAges,
        List<Guid>? ExtraIds, Dictionary<Guid, int>? ExtraCounts);

    public record Response(
        Guid BungalowId, string Slug, LocalizedText Title, Currency Currency,
        DateOnly CheckInDate, DateOnly CheckOutDate, int Nights, int Adults,
        int StandardCapacity, int MaxCapacity,
        List<PriceLine> NightLines, decimal AccommodationTotal,
        BungalowExtraAdultLine? ExtraAdults,
        List<BungalowChildLine> Children, decimal ChildrenTotal,
        List<BungalowExtraLine> Extras, decimal ExtrasTotal,
        decimal Total);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<Response>> Handle(string slug, Command cmd, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var bungalow = await db.Bungalows.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (bungalow is null)
                return Result<Response>.Fail(Error.NotFound("Bungalov bulunamadı."));

            var ages = cmd.ChildAges ?? [];
            var totalGuests = cmd.Adults + ages.Count;

            var validator = new Validator()
                .Must("checkInDate", cmd.CheckInDate is not null, "checkInDate zorunludur.")
                .Must("checkOutDate", cmd.CheckOutDate is not null, "checkOutDate zorunludur.")
                .Must("adults", cmd.Adults is >= 1 and <= MaxAdults, $"adults 1 ile {MaxAdults} arasında olmalı.")
                .Must("childAges", ages.Count <= MaxChildren, $"En fazla {MaxChildren} çocuk eklenebilir.")
                .Must("guests", totalGuests <= bungalow.MaxCapacity,
                      $"Bu bungalov en fazla {bungalow.MaxCapacity} kişi kabul eder.");

            for (var i = 0; i < ages.Count && ages.Count <= MaxChildren; i++)
            {
                if (ages[i] is < 0 or > 17)
                    validator.AddError($"childAges[{i}]", "Çocuk yaşı 0 ile 17 arasında olmalı (18 ve üzeri yetişkin sayılır).");
            }

            if (!validator.IsValid) return validator.ToFailure<Response>();

            var checkIn = cmd.CheckInDate!.Value;
            var checkOut = cmd.CheckOutDate!.Value;
            var nights = checkOut.DayNumber - checkIn.DayNumber;

            validator
                .Must("checkInDate", checkIn >= TurkeyClock.Today, "Giriş tarihi geçmişte olamaz.")
                .Must("checkOutDate", nights >= 1, "Çıkış tarihi giriş tarihinden sonra olmalı.")
                .Must("checkOutDate", nights <= MaxNights, $"Konaklama süresi en fazla {MaxNights} gece olabilir.");

            // Seçilen ekstralar bungalovun üzerindeki kopyalardan alınır
            var selections = new List<(BungalowExtraSnapshot Extra, int Count)>();
            var extraIds = cmd.ExtraIds ?? [];
            var extraCounts = cmd.ExtraCounts ?? new Dictionary<Guid, int>();

            if (extraIds.Count > MaxExtras)
                validator.AddError("extraIds", $"En fazla {MaxExtras} ekstra seçilebilir.");
            else if (extraIds.Count != extraIds.Distinct().Count())
                validator.AddError("extraIds", "Aynı ekstra birden fazla kez seçilemez.");
            else
            {
                for (var i = 0; i < extraIds.Count; i++)
                {
                    var extra = bungalow.Extras.FirstOrDefault(e => e.ExtraId == extraIds[i]);
                    if (extra is null)
                    {
                        validator.AddError($"extraIds[{i}]", "Bu bungalovda böyle bir ekstra yok.");
                        continue;
                    }

                    // Daily mode'da adet her zaman 1
                    if (extra.ChargeMode == ExtraChargeMode.Daily)
                    {
                        selections.Add((extra, 1));
                        continue;
                    }

                    // Once mode: adet zorunlu, 1-20 arası
                    var count = extraCounts.TryGetValue(extra.ExtraId, out var c) ? c : 1;
                    if (count is < 1 or > 20)
                    {
                        validator.AddError($"extraCounts[{extra.Key}]", "Adet 1 ile 20 arasında olmalı.");
                        continue;
                    }

                    selections.Add((extra, count));
                }
            }

            if (!validator.IsValid) return validator.ToFailure<Response>();

            var priceRules = await db.PriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.Bungalow && x.OwnerId == bungalow.Id && x.IsActive)
                .ToListAsync(ct);

            var ageRules = await db.AgePriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.Bungalow && x.OwnerId == bungalow.Id && x.IsActive)
                .ToListAsync(ct);

            var lines = PeriodPricing.BuildLines(checkIn, nights, bungalow.DefaultPricePerNight, priceRules);
            var accommodationTotal = lines.Sum(l => l.Subtotal);

            var extraAdults = BungalowPricing.PriceExtraAdults(
                cmd.Adults, bungalow.StandardCapacity, nights, bungalow.ExtraAdultPricePerNight);
            var extraAdultsTotal = extraAdults?.Total ?? 0m;

            var children = BungalowPricing.PriceChildren(ages, nights, ageRules);
            var childrenTotal = children.Sum(c => c.Total);

            var extraLines = BungalowPricing.PriceExtras(selections, nights);
            var extrasTotal = extraLines.Sum(e => e.Subtotal);

            return Result<Response>.Success(new Response(
                bungalow.Id, bungalow.Slug, bungalow.Title, bungalow.Currency,
                checkIn, checkOut, nights, cmd.Adults,
                bungalow.StandardCapacity, bungalow.MaxCapacity,
                lines, accommodationTotal,
                extraAdults,
                children, childrenTotal,
                extraLines, extrasTotal,
                accommodationTotal + extraAdultsTotal + childrenTotal + extrasTotal));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/bungalows/{slug}/quote",
                    async (string slug, Command cmd, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, cmd, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}