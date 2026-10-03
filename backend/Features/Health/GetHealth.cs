using Rentravel.Shared;

namespace Rentravel.Features.Health;

public static class GetHealth
{
    public record Response(string Status, DateTime UtcNow);

    public class Handler
    {
        public Response Handle() => new("ok", DateTime.UtcNow);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/health", (Handler handler) => Results.Ok(handler.Handle()));
    }
}