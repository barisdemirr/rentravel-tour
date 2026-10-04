using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationPrices;

public static class GetAccommodationPrices
{
    public class Handler(AppDbContext db)
    {
        // Pasifler dahil, konaklama tiplerinin katalog sırasıyla
        public async Task<Result<List<AccommodationPriceDto>>> Handle(Guid tourId, CancellationToken ct)
        {
            if (!await db.CultureTours.AnyAsync(x => x.Id == tourId, ct))
                return Result<List<AccommodationPriceDto>>.Fail(Error.NotFound("Tur bulunamadı."));

            var prices = await db.CultureTourAccommodationPrices.AsNoTracking()
                .Include(x => x.AccommodationType)
                .Where(x => x.CultureTourId == tourId)
                .OrderBy(x => x.AccommodationType!.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return Result<List<AccommodationPriceDto>>.Success(
                prices.Select(p => AccommodationPriceDto.From(p, p.AccommodationType)).ToList());
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/culture-tours/{tourId:guid}/accommodation-prices",
                async (Guid tourId, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(tourId, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}