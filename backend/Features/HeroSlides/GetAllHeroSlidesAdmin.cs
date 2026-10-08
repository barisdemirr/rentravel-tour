using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class GetAllHeroSlidesAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<HeroSlideDto>> Handle(CancellationToken ct)
        {
            var items = await db.HeroSlides.AsNoTracking()
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Take(500)
                .ToListAsync(ct);

            return items.Select(HeroSlideDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/hero-slides",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}