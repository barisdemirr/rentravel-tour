using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class UpdateHeroSlide
{
    public class Handler(AppDbContext db, HeroSlideSaveHandler saver)
    {
        public async Task<Result<HeroSlideDto>> Handle(Guid id, HeroSlideInput input, CancellationToken ct)
        {
            var slide = await db.HeroSlides.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (slide is null) return Result<HeroSlideDto>.Fail(Error.NotFound("Slayt bulunamadı."));

            return await saver.Save(slide, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/hero-slides/{id:guid}",
                async (Guid id, HeroSlideInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}