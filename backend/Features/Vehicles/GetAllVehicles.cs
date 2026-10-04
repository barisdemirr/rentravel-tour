using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Vehicles;

public static class GetAllVehicles
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<VehicleListItemDto>> Handle(
            string? segmentKey, bool? featured, int limit, CancellationToken ct)
        {
            var query = db.Vehicles.AsNoTracking().Where(x => x.IsActive);

            if (!string.IsNullOrWhiteSpace(segmentKey))
            {
                var key = segmentKey.Trim().ToLowerInvariant();
                query = query.Where(x => x.Segment != null && x.Segment.Key == key);
            }

            if (featured == true)
                query = query.Where(x => x.IsFeatured);

            var vehicles = await query
                .Include(x => x.Segment)
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Take(limit)
                .ToListAsync(ct);

            return vehicles.Select(VehicleListItemDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/vehicles",
                    async (string? segment, bool? featured, int? limit, Handler handler, CancellationToken ct) =>
                        Results.Ok(await handler.Handle(segment, featured, Math.Clamp(limit ?? 100, 1, 100), ct)))
                .AllowAnonymous();
    }
}