using Rentravel.Shared;

namespace Rentravel.Features.StaticPages;

public static class CreateStaticPage
{
    public class Handler(StaticPageSaveHandler saver)
    {
        public Task<Result<StaticPageDto>> Handle(StaticPageInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/static-pages",
                async (StaticPageInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}