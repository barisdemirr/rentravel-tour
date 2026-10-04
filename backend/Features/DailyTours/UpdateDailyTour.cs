using Microsoft.EntityFrameworkCore;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class UpdateDailyTour
{
    public class Handler(AppDbContext db, DailyTourSaveHandler saver)
    {
        public async Task<Result<TourDto>> Handle(Guid id, TourInput input, CancellationToken ct)
        {
            var tour = await db.DailyTours.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (tour is null)
                return Result<TourDto>.Fail(Error.NotFound("Tur bulunamadı."));

            return await saver.Save(tour, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/daily-tours/{id:guid}",
                async (Guid id, TourInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}