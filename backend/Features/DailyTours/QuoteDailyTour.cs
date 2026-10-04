using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.Pricing;
using Rentravel.Domain.ValueObjects;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class QuoteDailyTour
{
    public record Response(
        Guid TourId, string Slug, LocalizedText Title, Currency Currency, DateOnly Date,
        int Adults, decimal AdultUnitPrice, PriceSource PriceSource, LocalizedText? PriceLabel, decimal AdultsTotal,
        List<ChildLine> Children, decimal ChildrenTotal, decimal Total, int? SeatsLeft);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<Response>> Handle(string slug, TourQuoteInput input, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.DailyTours.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (tour is null)
                return Result<Response>.Fail(Error.NotFound("Tur bulunamadı."));

            var validator = TourQuoteValidation.Validate(new Validator(), input);
            if (!validator.IsValid) return validator.ToFailure<Response>();

            var date = input.Date!.Value;
            var ages = input.ChildAges ?? [];
            var guests = input.Adults + ages.Count;

            var sessions = await db.TourSessions.AsNoTracking()
                .Where(x => x.TourType == TourType.Daily && x.TourId == tour.Id)
                .ToListAsync(ct);

            var session = SessionAvailability.Check(sessions, date, guests, validator);
            if (!validator.IsValid) return validator.ToFailure<Response>();

            var priceRules = await db.PriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.DailyTour && x.OwnerId == tour.Id && x.IsActive)
                .ToListAsync(ct);

            var ageRules = await db.AgePriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.DailyTour && x.OwnerId == tour.Id && x.IsActive)
                .ToListAsync(ct);

            var adult = TourPricing.ResolveAdultPrice(date, session?.PriceOverride, priceRules, tour.DefaultBasePrice);
            var adultsTotal = adult.UnitPrice * input.Adults;

            var children = TourPricing.PriceChildren(ages, adult.UnitPrice, ageRules);
            var childrenTotal = children.Sum(c => c.UnitPrice);

            return Result<Response>.Success(new Response(
                tour.Id, tour.Slug, tour.Title, tour.Currency, date,
                input.Adults, adult.UnitPrice, adult.Source, adult.Label, adultsTotal,
                children, childrenTotal, adultsTotal + childrenTotal, session?.Seats));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/daily-tours/{slug}/quote",
                    async (string slug, TourQuoteInput input, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, input, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}