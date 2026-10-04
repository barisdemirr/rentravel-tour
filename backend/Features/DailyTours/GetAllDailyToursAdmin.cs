using Microsoft.EntityFrameworkCore;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class GetAllDailyToursAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<PagedResult<TourListItemDto>> Handle(int page, int pageSize, CancellationToken ct)
        {
            var query = db.DailyTours.AsNoTracking();

            var total = await query.CountAsync(ct);

            var items = await query
                .Include(x => x.Category)
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PagedResult<TourListItemDto>(
                items.Select(TourListItemDto.From).ToList(), total, page, pageSize);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/daily-tours",
                async (int? page, int? pageSize, Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(
                        Math.Max(page ?? 1, 1), Math.Clamp(pageSize ?? 20, 1, 100), ct)));
    }
}