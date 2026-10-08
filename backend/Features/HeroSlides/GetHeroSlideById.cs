using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class GetHeroSlideById
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<HeroSlideDto>> Handle(Guid id, CancellationToken ct)
        {
            var slide = await db.HeroSlides.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
            if (slide is null) return Result<HeroSlideDto>.Fail(Error.NotFound("Slayt bulunamadı."));

            return Result<HeroSlideDto>.Success(HeroSlideDto.From(slide));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/hero-slides/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}