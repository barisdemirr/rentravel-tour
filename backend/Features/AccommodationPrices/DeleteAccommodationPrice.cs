using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationPrices;

public static class DeleteAccommodationPrice
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var price = await db.CultureTourAccommodationPrices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (price is null)
                return Result.Fail(Error.NotFound("Konaklama fiyatı bulunamadı."));

            db.CultureTourAccommodationPrices.Remove(price); // soft delete'e çevrilir
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/accommodation-prices/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}