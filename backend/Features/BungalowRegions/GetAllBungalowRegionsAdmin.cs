using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.BungalowRegions;

// Panel için: pasif kayıtlar dahil tüm bölgeler
public static class GetAllBungalowRegionsAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<BungalowRegionDto>> Handle(CancellationToken ct)
        {
            var regions = await db.BungalowRegions
                .AsNoTracking()
                .OrderBy(x => x.OrderIndex).ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return regions.Select(BungalowRegionDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/bungalow-regions",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}