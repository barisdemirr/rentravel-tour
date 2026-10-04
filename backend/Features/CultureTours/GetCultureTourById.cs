using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class GetCultureTourById
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<CultureTourDto>> Handle(Guid id, CancellationToken ct)
        {
            var tour = await db.CultureTours.AsNoTracking()
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.Id == id, ct);

            return tour is null
                ? Result<CultureTourDto>.Fail(Error.NotFound("Tur bulunamadı."))
                : Result<CultureTourDto>.Success(CultureTourDto.From(tour));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/culture-tours/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}