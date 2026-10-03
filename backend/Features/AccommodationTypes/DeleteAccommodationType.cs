using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationTypes;

public static class DeleteAccommodationType
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var type = await db.AccommodationTypes.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (type is null)
                return Result.Fail(Error.NotFound("Konaklama tipi bulunamadı."));

            db.AccommodationTypes.Remove(type); // soft delete'e çevrilir
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/accommodation-types/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}