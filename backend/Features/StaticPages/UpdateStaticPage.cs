using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public static class UpdateStaticPage
{
    public class Handler(AppDbContext db, StaticPageSaveHandler saver)
    {
        public async Task<Result<StaticPageDto>> Handle(Guid id, StaticPageInput input, CancellationToken ct)
        {
            var page = await db.StaticPages.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (page is null)
                return Result<StaticPageDto>.Fail(Error.NotFound("Sayfa bulunamadı."));

            return await saver.Save(page, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/static-pages/{id:guid}",
                async (Guid id, StaticPageInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}