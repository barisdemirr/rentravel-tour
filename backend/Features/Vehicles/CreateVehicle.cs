using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

public static class CreateVehicle
{
    public class Handler(VehicleSaveHandler saver)
    {
        public Task<Result<VehicleDto>> Handle(VehicleInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/vehicles",
                async (VehicleInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}