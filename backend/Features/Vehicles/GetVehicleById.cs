using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

public static class GetVehicleById
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<VehicleDto>> Handle(Guid id, CancellationToken ct)
        {
            var vehicle = await db.Vehicles.AsNoTracking()
                .Include(x => x.Segment)
                .FirstOrDefaultAsync(x => x.Id == id, ct);

            return vehicle is null
                ? Result<VehicleDto>.Fail(Error.NotFound("Araç bulunamadı."))
                : Result<VehicleDto>.Success(VehicleDto.From(vehicle));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/vehicles/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}