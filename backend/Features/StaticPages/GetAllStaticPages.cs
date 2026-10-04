using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public static class GetAllStaticPages
{
    public class Handler(AppDbContext db)
    {
        // Footer bağlantıları: yayındaki sayfaların slug ve başlığı
        public async Task<List<StaticPageLinkDto>> Handle(CancellationToken ct)
        {
            var pages = await db.StaticPages.AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return pages.Select(p => new StaticPageLinkDto(p.Slug, p.Title)).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/static-pages",
                    async (Handler handler, CancellationToken ct) =>
                        Results.Ok(await handler.Handle(ct)))
                .AllowAnonymous();
    }
}