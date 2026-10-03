using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.BungalowRegions;

public static class GetAllBungalowRegions
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<BungalowRegionDto>> Handle(CancellationToken ct)
        {
            var regions = await db.BungalowRegions
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return regions.Select(BungalowRegionDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/bungalow-regions",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)))
                    .AllowAnonymous();
    }
}