using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public static class GetStaticPageBySlug
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<StaticPageDto>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var page = await db.StaticPages.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            return page is null
                ? Result<StaticPageDto>.Fail(Error.NotFound("Sayfa bulunamadı."))
                : Result<StaticPageDto>.Success(StaticPageDto.From(page));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/static-pages/{slug}",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}