using Microsoft.EntityFrameworkCore;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class GetAllDailyTours
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<TourListItemDto>> Handle(
            string? categoryKey, bool? featured, int limit, CancellationToken ct)
        {
            var query = db.DailyTours.AsNoTracking().Where(x => x.IsActive);

            if (!string.IsNullOrWhiteSpace(categoryKey))
            {
                var key = categoryKey.Trim().ToLowerInvariant();
                query = query.Where(x => x.Category != null && x.Category.Key == key);
            }

            if (featured == true)
                query = query.Where(x => x.IsFeatured);

            var tours = await query
                .Include(x => x.Category)
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Take(limit)
                .ToListAsync(ct);

            return tours.Select(t => TourListItemDto.From(t)).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/daily-tours",
                    async (string? category, bool? featured, int? limit, Handler handler, CancellationToken ct) =>
                        Results.Ok(await handler.Handle(category, featured, Math.Clamp(limit ?? 100, 1, 100), ct)))
                .AllowAnonymous();
    }
}