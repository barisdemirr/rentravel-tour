using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.BungalowExtras;

public static class GetAllBungalowExtras
{
    public class Handler(AppDbContext db)
    {
        // Admin kataloğu: taslaklar (IsActive = false) dahil hepsi
        public async Task<List<BungalowExtraDto>> Handle(CancellationToken ct)
        {
            var extras = await db.BungalowExtras
                .AsNoTracking()
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return extras.Select(BungalowExtraDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/bungalow-extras",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}