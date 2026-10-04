using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class UpdateCultureTour
{
    public class Handler(AppDbContext db, CultureTourSaveHandler saver)
    {
        public async Task<Result<CultureTourDto>> Handle(Guid id, CultureTourInput input, CancellationToken ct)
        {
            var tour = await db.CultureTours.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (tour is null)
                return Result<CultureTourDto>.Fail(Error.NotFound("Tur bulunamadı."));

            return await saver.Save(tour, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/culture-tours/{id:guid}",
                async (Guid id, CultureTourInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}