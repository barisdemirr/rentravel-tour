using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourSessions;

public static class UpdateTourSession
{
    public class Handler(AppDbContext db, TourSessionSaveHandler saver)
    {
        public async Task<Result<TourSessionDto>> Handle(Guid id, SessionInput input, CancellationToken ct)
        {
            var session = await db.TourSessions.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (session is null)
                return Result<TourSessionDto>.Fail(Error.NotFound("Seans bulunamadı."));

            return await saver.Save(null, Guid.Empty, session, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/tour-sessions/{id:guid}",
                async (Guid id, SessionInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}