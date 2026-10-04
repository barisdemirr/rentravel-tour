using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public static class GetBungalowById
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<BungalowDto>> Handle(Guid id, CancellationToken ct)
        {
            var bungalow = await db.Bungalows.AsNoTracking()
                .Include(x => x.Region)
                .FirstOrDefaultAsync(x => x.Id == id, ct);

            return bungalow is null
                ? Result<BungalowDto>.Fail(Error.NotFound("Bungalov bulunamadı."))
                : Result<BungalowDto>.Success(BungalowDto.From(bungalow));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/bungalows/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}