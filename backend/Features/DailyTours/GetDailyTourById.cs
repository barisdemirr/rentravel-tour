using Microsoft.EntityFrameworkCore;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class GetDailyTourById
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<TourDto>> Handle(Guid id, CancellationToken ct)
        {
            var tour = await db.DailyTours.AsNoTracking()
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.Id == id, ct);

            return tour is null
                ? Result<TourDto>.Fail(Error.NotFound("Tur bulunamadı."))
                : Result<TourDto>.Success(TourDto.From(tour));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/daily-tours/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}