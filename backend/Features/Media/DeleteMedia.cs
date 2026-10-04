using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.Media;

public static class DeleteMedia
{
    public class Handler(AppDbContext db, MediaUsageChecker usageChecker)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var asset = await db.MediaAssets.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (asset is null)
                return Result.Fail(Error.NotFound("Görsel bulunamadı."));

            var usages = await usageChecker.FindUsagesAsync(id, ct);
            if (usages.Count > 0)
            {
                var shown = string.Join(", ", usages.Take(5));
                var more = usages.Count > 5 ? $" ve {usages.Count - 5} yer daha" : "";
                return Result.Fail(Error.Conflict($"Görsel kullanımda, silinemez: {shown}{more}."));
            }

            db.MediaAssets.Remove(asset); // soft delete'e çevrilir
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/media/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}