using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleExtras;

public static class GetAllVehicleExtras
{
    public class Handler(AppDbContext db)
    {
        // Admin kataloğu: taslaklar (IsActive = false) dahil hepsi
        public async Task<List<VehicleExtraDto>> Handle(CancellationToken ct)
        {
            var extras = await db.VehicleExtras
                .AsNoTracking()
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return extras.Select(VehicleExtraDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/vehicle-extras",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}