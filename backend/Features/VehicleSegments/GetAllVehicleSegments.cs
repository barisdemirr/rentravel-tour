using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleSegments;

public static class GetAllVehicleSegments
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<VehicleSegmentDto>> Handle(CancellationToken ct)
        {
            var segments = await db.VehicleSegments
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return segments.Select(VehicleSegmentDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/vehicle-segments",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)))
                    .AllowAnonymous();
    }
}