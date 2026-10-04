using Rentravel.Domain.Enums;
using Rentravel.Shared;

namespace Rentravel.Features.TourSessions;

public static class CreateTourSession
{
    public record Command : SessionInput
    {
        public TourType? TourType { get; init; }
        public Guid TourId { get; init; }
    }

    public class Handler(TourSessionSaveHandler saver)
    {
        public Task<Result<TourSessionDto>> Handle(Command cmd, CancellationToken ct) =>
            saver.Save(cmd.TourType, cmd.TourId, null, cmd, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/tour-sessions",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}