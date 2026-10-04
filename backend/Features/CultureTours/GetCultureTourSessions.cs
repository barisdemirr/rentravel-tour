using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class GetCultureTourSessions
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<List<PublicSessionDto>>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.CultureTours.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (tour is null)
                return Result<List<PublicSessionDto>>.Fail(Error.NotFound("Tur bulunamadı."));

            var today = TurkeyClock.Today;

            var sessions = await db.TourSessions.AsNoTracking()
                .Where(x => x.TourType == TourType.Culture && x.TourId == tour.Id && x.IsActive && x.Date >= today)
                .OrderBy(x => x.Date)
                .ToListAsync(ct);

            return Result<List<PublicSessionDto>>.Success(
                sessions.Select(s => new PublicSessionDto(s.Date, s.Seats, null)).ToList());
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/culture-tours/{slug}/sessions",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}