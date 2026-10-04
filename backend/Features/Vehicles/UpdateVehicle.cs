using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

public static class UpdateVehicle
{
    public class Handler(AppDbContext db, VehicleSaveHandler saver)
    {
        public async Task<Result<VehicleDto>> Handle(Guid id, VehicleInput input, CancellationToken ct)
        {
            var vehicle = await db.Vehicles.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (vehicle is null)
                return Result<VehicleDto>.Fail(Error.NotFound("Araç bulunamadı."));

            return await saver.Save(vehicle, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/vehicles/{id:guid}",
                async (Guid id, VehicleInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}