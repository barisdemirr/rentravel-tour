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

    public record Command(DateOnly? CheckInDate, DateOnly? CheckOutDate, int Adults, List<int>? ChildAges);

    public record Response(
        Guid BungalowId, string Slug, LocalizedText Title, Currency Currency,
        DateOnly CheckInDate, DateOnly CheckOutDate, int Nights, int Adults,
        List<PriceLine> NightLines, decimal AccommodationTotal,
        List<BungalowChildLine> Children, decimal ChildrenTotal, decimal Total);

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

            var validator = new Validator()
                .Must("checkInDate", cmd.CheckInDate is not null, "checkInDate zorunludur.")
                .Must("checkOutDate", cmd.CheckOutDate is not null, "checkOutDate zorunludur.")
                .Must("adults", cmd.Adults is >= 1 and <= MaxAdults, $"adults 1 ile {MaxAdults} arasında olmalı.")
                .Must("childAges", ages.Count <= MaxChildren, $"En fazla {MaxChildren} çocuk eklenebilir.");

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

            if (!validator.IsValid) return validator.ToFailure<Response>();

            var priceRules = await db.PriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.Bungalow && x.OwnerId == bungalow.Id && x.IsActive)
                .ToListAsync(ct);

            var ageRules = await db.AgePriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.Bungalow && x.OwnerId == bungalow.Id && x.IsActive)
                .ToListAsync(ct);

            // Her gece, o gecenin tarihine uyan kuralla fiyatlanır (araçtaki günlük hesapla aynı mantık)
            var lines = PeriodPricing.BuildLines(checkIn, nights, bungalow.DefaultPricePerNight, priceRules);
            var accommodationTotal = lines.Sum(l => l.Subtotal);

            var children = BungalowPricing.PriceChildren(ages, nights, ageRules);
            var childrenTotal = children.Sum(c => c.Total);

            return Result<Response>.Success(new Response(
                bungalow.Id, bungalow.Slug, bungalow.Title, bungalow.Currency,
                checkIn, checkOut, nights, cmd.Adults,
                lines, accommodationTotal, children, childrenTotal, accommodationTotal + childrenTotal));
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