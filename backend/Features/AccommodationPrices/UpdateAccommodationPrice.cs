using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationPrices;

public static class UpdateAccommodationPrice
{
    public record Command(decimal PricePerPerson, bool? IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<AccommodationPriceDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var price = await db.CultureTourAccommodationPrices
                .Include(x => x.AccommodationType)
                .FirstOrDefaultAsync(x => x.Id == id, ct);

            if (price is null)
                return Result<AccommodationPriceDto>.Fail(Error.NotFound("Konaklama fiyatı bulunamadı."));

            var validator = new Validator()
                .Must("pricePerPerson", cmd.PricePerPerson > 0, "pricePerPerson 0'dan büyük olmalı.");

            if (!validator.IsValid) return validator.ToFailure<AccommodationPriceDto>();

            price.PricePerPerson = cmd.PricePerPerson;
            price.IsActive = cmd.IsActive ?? price.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<AccommodationPriceDto>.Success(AccommodationPriceDto.From(price, price.AccommodationType));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/accommodation-prices/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}