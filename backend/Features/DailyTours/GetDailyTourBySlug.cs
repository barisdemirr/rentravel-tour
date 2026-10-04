using Microsoft.EntityFrameworkCore;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class GetDailyTourBySlug
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<TourDto>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.DailyTours.AsNoTracking()
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            return tour is null
                ? Result<TourDto>.Fail(Error.NotFound("Tur bulunamadı."))
                : Result<TourDto>.Success(TourDto.From(tour));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/daily-tours/{slug}",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}