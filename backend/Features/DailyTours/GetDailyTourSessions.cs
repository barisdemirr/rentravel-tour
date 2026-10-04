using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.Pricing;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class GetDailyTourSessions
{
    public class Handler(AppDbContext db)
    {
        // Yayındaki turun ileri tarihli aktif seansları ve her tarihin yetişkin fiyatı
        public async Task<Result<List<PublicSessionDto>>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.DailyTours.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (tour is null)
                return Result<List<PublicSessionDto>>.Fail(Error.NotFound("Tur bulunamadı."));

            var today = TurkeyClock.Today;

            var sessions = await db.TourSessions.AsNoTracking()
                .Where(x => x.TourType == TourType.Daily && x.TourId == tour.Id && x.IsActive && x.Date >= today)
                .OrderBy(x => x.Date)
                .ToListAsync(ct);

            var rules = await db.PriceRules.AsNoTracking()
                .Where(x => x.OwnerType == PriceOwnerType.DailyTour && x.OwnerId == tour.Id && x.IsActive)
                .ToListAsync(ct);

            var result = sessions
                .Select(s => new PublicSessionDto(
                    s.Date, s.Seats,
                    TourPricing.ResolveAdultPrice(s.Date, s.PriceOverride, rules, tour.DefaultBasePrice).UnitPrice))
                .ToList();

            return Result<List<PublicSessionDto>>.Success(result);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/daily-tours/{slug}/sessions",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}