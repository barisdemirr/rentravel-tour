using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleSegments;

public static class DeleteVehicleSegment
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var segment = await db.VehicleSegments.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (segment is null)
                return Result.Fail(Error.NotFound("Segment bulunamadı."));

            // AppDbContext bunu soft delete'e çevirir (DeletedAt dolar, IsActive = false)
            db.VehicleSegments.Remove(segment);
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/vehicle-segments/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}