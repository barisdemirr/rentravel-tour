using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class ReorderHeroSlides
{
    public record Item(Guid Id, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(List<Item> items, CancellationToken ct)
        {
            if (items.Count == 0) return Result.Success();

            var ids = items.Select(x => x.Id).ToList();
            var slides = await db.HeroSlides.Where(x => ids.Contains(x.Id)).ToListAsync(ct);

            if (slides.Count != ids.Count)
                return Result.Fail(Error.Validation(new() { ["items"] = ["Bazı slaytlar bulunamadı."] }));

            var map = items.ToDictionary(x => x.Id, x => x.OrderIndex);
            foreach (var slide in slides) slide.OrderIndex = map[slide.Id];

            await db.SaveChangesAsync(ct);
            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/hero-slides/reorder",
                async (List<Item> items, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(items, ct)).ToHttp(() => Results.NoContent()));
    }
}