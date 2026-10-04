using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public static class UpdateBungalow
{
    public class Handler(AppDbContext db, BungalowSaveHandler saver)
    {
        public async Task<Result<BungalowDto>> Handle(Guid id, BungalowInput input, CancellationToken ct)
        {
            var bungalow = await db.Bungalows.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (bungalow is null)
                return Result<BungalowDto>.Fail(Error.NotFound("Bungalov bulunamadı."));

            return await saver.Save(bungalow, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/bungalows/{id:guid}",
                async (Guid id, BungalowInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}