using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class GetAllCultureToursAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<PagedResult<CultureTourListItemDto>> Handle(int page, int pageSize, CancellationToken ct)
        {
            var query = db.CultureTours.AsNoTracking();

            var total = await query.CountAsync(ct);

            var items = await query
                .Include(x => x.Category)
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PagedResult<CultureTourListItemDto>(
                items.Select(t => CultureTourListItemDto.From(t)).ToList(), total, page, pageSize);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/culture-tours",
                async (int? page, int? pageSize, Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(
                        Math.Max(page ?? 1, 1), Math.Clamp(pageSize ?? 20, 1, 100), ct)));
    }
}