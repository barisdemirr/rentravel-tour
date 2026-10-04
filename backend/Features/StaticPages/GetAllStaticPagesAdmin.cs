using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public static class GetAllStaticPagesAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<StaticPageListItemDto>> Handle(CancellationToken ct)
        {
            var pages = await db.StaticPages.AsNoTracking()
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return pages.Select(StaticPageListItemDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/static-pages",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}