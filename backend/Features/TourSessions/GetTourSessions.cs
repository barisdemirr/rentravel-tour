using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourSessions;

public static class GetTourSessions
{
    public class Handler(AppDbContext db)
    {
        // Bir turun tüm seansları (pasifler ve geçmişler dahil), tarihe göre
        public async Task<List<TourSessionDto>> Handle(TourType tourType, Guid tourId, CancellationToken ct)
        {
            var sessions = await db.TourSessions.AsNoTracking()
                .Where(x => x.TourType == tourType && x.TourId == tourId)
                .OrderBy(x => x.Date)
                .ToListAsync(ct);

            return sessions.Select(TourSessionDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/tour-sessions",
                async (string? tourType, Guid? tourId, Handler handler, CancellationToken ct) =>
                {
                    var errors = new Dictionary<string, string[]>();

                    if (!QueryParsing.TryParseEnum<TourType>(tourType, out var type))
                        errors["tourType"] = ["tourType zorunlu ve geçerli olmalı (Daily, Culture)."];

                    if (tourId is null || tourId == Guid.Empty)
                        errors["tourId"] = ["tourId zorunludur."];

                    if (errors.Count > 0) return Results.ValidationProblem(errors);

                    return Results.Ok(await handler.Handle(type, tourId!.Value, ct));
                });
    }
}