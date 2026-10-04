using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public static class GetStaticPageById
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<StaticPageDto>> Handle(Guid id, CancellationToken ct)
        {
            var page = await db.StaticPages.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);

            return page is null
                ? Result<StaticPageDto>.Fail(Error.NotFound("Sayfa bulunamadı."))
                : Result<StaticPageDto>.Success(StaticPageDto.From(page));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/static-pages/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}