using System.Globalization;
using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.Pricing;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

public static class QuoteVehicle
{
    private const int MaxDays = 365;

    public record Command(
        DateOnly? PickupDate, string? PickupTime,
        DateOnly? ReturnDate, string? ReturnTime,
        List<Guid>? ExtraIds);

    public record ExtraLine(Guid ExtraId, string Key, LocalizedText Title, decimal DailyPrice, int Days, decimal Subtotal);

    public record Response(
        Guid VehicleId, string Slug, LocalizedText Name, Currency Currency,
        DateOnly PickupDate, string PickupTime, DateOnly ReturnDate, string ReturnTime,
        int Days, List<PriceLine> RentalLines, decimal RentalTotal,
        List<ExtraLine> ExtraLines, decimal ExtrasTotal, decimal Total,
        decimal Deposit, int? KmLimit, decimal? ExtraKmPrice);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<Response>> Handle(string slug, Command cmd, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var vehicle = await db.Vehicles.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (vehicle is null)
                return Result<Response>.Fail(Error.NotFound("Araç bulunamadı."));

            var pickupTime = ParseTime(cmd.PickupTime);
            var returnTime = ParseTime(cmd.ReturnTime);

            var validator = new Validator()
                .Must("pickupDate", cmd.PickupDate is not null, "pickupDate zorunludur.")
                .Must("returnDate", cmd.ReturnDate is not null, "returnDate zorunludur.")
                .Must("pickupTime", pickupTime is not null, "pickupTime SS:dd biçiminde olmalı (örn: 10:00).")
                .Must("returnTime", returnTime is not null, "returnTime SS:dd biçiminde olmalı (örn: 10:00).");

            if (!validator.IsValid) return validator.ToFailure<Response>();

            var pickupDate = cmd.PickupDate!.Value;
            var returnDate = cmd.ReturnDate!.Value;
            var pickup = pickupDate.ToDateTime(pickupTime!.Value);
            var drop = returnDate.ToDateTime(returnTime!.Value);
            var days = PeriodPricing.CountPeriods(pickup, drop);

            validator
                .Must("pickupDate", pickupDate >= TurkeyClock.Today, "Alış tarihi geçmişte olamaz.")
                .Must("returnDate", days > 0, "Teslim zamanı alış zamanından sonra olmalı.")
                .Must("returnDate", days <= MaxDays, $"Kiralama süresi en fazla {MaxDays} gün olabilir.");

            // Seçilen ekstralar aracın üzerindeki kopyalardan alınır (katalogdaki güncel fiyat değil)
            var selected = new List<VehicleExtraSnapshot>();
            var extraIds = cmd.ExtraIds ?? [];

            if (extraIds.Count != extraIds.Distinct().Count())
                validator.AddError("extraIds", "Aynı ekstra birden fazla kez seçilemez.");
            else
            {
                for (var i = 0; i < extraIds.Count; i++)
                {
                    var extra = vehicle.Extras.FirstOrDefault(e => e.ExtraId == extraIds[i]);
                    if (extra is null)
                        validator.AddError($"extraIds[{i}]", "Bu araçta böyle bir ekstra yok.");
                    else
                        selected.Add(extra);
                }
            }

            if (!validator.IsValid) return validator.ToFailure<Response>();

            var rules = await db.PriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.Vehicle && x.OwnerId == vehicle.Id && x.IsActive)
                .ToListAsync(ct);

            var lines = PeriodPricing.BuildLines(pickupDate, days, vehicle.DefaultDailyPrice, rules);
            var rentalTotal = lines.Sum(l => l.Subtotal);

            var extraLines = selected
                .Select(e => new ExtraLine(e.ExtraId, e.Key, e.Title, e.DailyPrice, days, e.DailyPrice * days))
                .ToList();
            var extrasTotal = extraLines.Sum(l => l.Subtotal);

            return Result<Response>.Success(new Response(
                vehicle.Id, vehicle.Slug, vehicle.Name, vehicle.Currency,
                pickupDate, pickupTime.Value.ToString("HH:mm"), returnDate, returnTime.Value.ToString("HH:mm"),
                days, lines, rentalTotal,
                extraLines, extrasTotal, rentalTotal + extrasTotal,
                vehicle.Deposit, vehicle.KmLimit, vehicle.ExtraKmPrice));
        }

        private static TimeOnly? ParseTime(string? value) =>
            TimeOnly.TryParseExact(value?.Trim(), ["HH:mm", "H:mm"], CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var time)
                ? time
                : null;
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/vehicles/{slug}/quote",
                    async (string slug, Command cmd, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, cmd, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}