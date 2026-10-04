using Rentravel.Shared;

namespace Rentravel.Features.Bungalows;

public static class CreateBungalow
{
    public class Handler(BungalowSaveHandler saver)
    {
        public Task<Result<BungalowDto>> Handle(BungalowInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/bungalows",
                async (BungalowInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}