using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public static class GetAllBungalows
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<BungalowListItemDto>> Handle(
            string? regionKey, bool? featured, int limit, CancellationToken ct)
        {
            var query = db.Bungalows.AsNoTracking().Where(x => x.IsActive);

            if (!string.IsNullOrWhiteSpace(regionKey))
            {
                var key = regionKey.Trim().ToLowerInvariant();
                query = query.Where(x => x.Region != null && x.Region.Key == key);
            }

            if (featured == true)
                query = query.Where(x => x.IsFeatured);

            var bungalows = await query
                .Include(x => x.Region)
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Take(limit)
                .ToListAsync(ct);

            return bungalows.Select(BungalowListItemDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/bungalows",
                    async (string? region, bool? featured, int? limit, Handler handler, CancellationToken ct) =>
                        Results.Ok(await handler.Handle(region, featured, Math.Clamp(limit ?? 100, 1, 100), ct)))
                .AllowAnonymous();
    }
}