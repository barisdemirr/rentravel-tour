using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationTypes;

public static class GetAllAccommodationTypes
{
    public class Handler(AppDbContext db)
    {
        // Admin kataloğu: taslaklar dahil hepsi
        public async Task<List<AccommodationTypeDto>> Handle(CancellationToken ct)
        {
            var types = await db.AccommodationTypes
                .AsNoTracking()
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return types.Select(AccommodationTypeDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/accommodation-types",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}