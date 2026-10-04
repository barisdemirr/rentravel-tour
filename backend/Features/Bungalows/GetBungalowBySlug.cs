using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public static class GetBungalowBySlug
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<BungalowDto>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var bungalow = await db.Bungalows.AsNoTracking()
                .Include(x => x.Region)
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            return bungalow is null
                ? Result<BungalowDto>.Fail(Error.NotFound("Bungalov bulunamadı."))
                : Result<BungalowDto>.Success(BungalowDto.From(bungalow));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/bungalows/{slug}",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}