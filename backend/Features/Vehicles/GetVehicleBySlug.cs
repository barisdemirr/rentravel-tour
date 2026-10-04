using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

public static class GetVehicleBySlug
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<VehicleDto>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var vehicle = await db.Vehicles.AsNoTracking()
                .Include(x => x.Segment)
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            return vehicle is null
                ? Result<VehicleDto>.Fail(Error.NotFound("Araç bulunamadı."))
                : Result<VehicleDto>.Success(VehicleDto.From(vehicle));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/vehicles/{slug}",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}