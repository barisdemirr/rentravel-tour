using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class GetHeroSlides
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<HeroSlideDto>> Handle(CancellationToken ct)
        {
            var items = await db.HeroSlides.AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.OrderIndex)
                .ToListAsync(ct);

            return items.Select(HeroSlideDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/hero-slides",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)))
                .AllowAnonymous();
    }
}