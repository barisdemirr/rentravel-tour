using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.Pricing;
using Rentravel.Domain.ValueObjects;
using Rentravel.Features.AccommodationPrices;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class QuoteCultureTour
{
    public record Command : TourQuoteInput
    {
        public Guid AccommodationTypeId { get; init; }
    }

    public record Response(
        Guid TourId, string Slug, LocalizedText Title, Currency Currency, int Nights, DateOnly Date,
        AccommodationTypeRef AccommodationType,
        int Adults, decimal AdultUnitPrice, decimal AdultsTotal,
        List<ChildLine> Children, decimal ChildrenTotal, decimal Total, int? SeatsLeft);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<Response>> Handle(string slug, Command cmd, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.CultureTours.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (tour is null)
                return Result<Response>.Fail(Error.NotFound("Tur bulunamadı."));

            var validator = TourQuoteValidation.Validate(new Validator(), cmd)
                .Must("accommodationTypeId", cmd.AccommodationTypeId != Guid.Empty, "accommodationTypeId zorunludur.");

            if (!validator.IsValid) return validator.ToFailure<Response>();

            // Seçilen konaklama tipi o tura tanımlı, aktif fiyatlı ve aktif bir tip olmalı
            var accommodation = await db.CultureTourAccommodationPrices.AsNoTracking()
                .Include(x => x.AccommodationType)
                .FirstOrDefaultAsync(x => x.CultureTourId == tour.Id
                                          && x.AccommodationTypeId == cmd.AccommodationTypeId
                                          && x.IsActive, ct);

            if (accommodation?.AccommodationType is not { IsActive: true } type)
            {
                validator.AddError("accommodationTypeId", "Bu tur için bu konaklama tipi seçilemez.");
                return validator.ToFailure<Response>();
            }

            var date = cmd.Date!.Value;
            var ages = cmd.ChildAges ?? [];
            var guests = cmd.Adults + ages.Count;

            var sessions = await db.TourSessions.AsNoTracking()
                .Where(x => x.TourType == TourType.Culture && x.TourId == tour.Id)
                .ToListAsync(ct);

            var session = SessionAvailability.Check(sessions, date, guests, validator);
            if (!validator.IsValid) return validator.ToFailure<Response>();

            var ageRules = await db.AgePriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.CultureTour && x.OwnerId == tour.Id && x.IsActive)
                .ToListAsync(ct);

            // Yetişkin birim fiyatı = konaklama tipinin kişi başı fiyatı
            var unitPrice = accommodation.PricePerPerson;
            var adultsTotal = unitPrice * cmd.Adults;

            var children = TourPricing.PriceChildren(ages, unitPrice, ageRules);
            var childrenTotal = children.Sum(c => c.UnitPrice);

            return Result<Response>.Success(new Response(
                tour.Id, tour.Slug, tour.Title, tour.Currency, tour.Nights, date,
                AccommodationTypeRef.From(type)!,
                cmd.Adults, unitPrice, adultsTotal,
                children, childrenTotal, adultsTotal + childrenTotal, session?.Seats));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/culture-tours/{slug}/quote",
                    async (string slug, Command cmd, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, cmd, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}