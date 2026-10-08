using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class DeleteHeroSlide
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var slide = await db.HeroSlides.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (slide is null) return Result.Fail(Error.NotFound("Slayt bulunamadı."));

            db.HeroSlides.Remove(slide); // soft delete
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/hero-slides/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}