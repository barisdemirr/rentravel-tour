using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class DeleteDailyTour
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var tour = await db.DailyTours.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (tour is null)
                return Result.Fail(Error.NotFound("Tur bulunamadı."));

            db.DailyTours.Remove(tour); // soft delete'e çevrilir
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/daily-tours/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}