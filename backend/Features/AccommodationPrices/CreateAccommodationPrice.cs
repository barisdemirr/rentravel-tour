using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationPrices;

public static class CreateAccommodationPrice
{
    public record Command(Guid AccommodationTypeId, decimal PricePerPerson, bool? IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<AccommodationPriceDto>> Handle(Guid tourId, Command cmd, CancellationToken ct)
        {
            if (!await db.CultureTours.AnyAsync(x => x.Id == tourId, ct))
                return Result<AccommodationPriceDto>.Fail(Error.NotFound("Tur bulunamadı."));

            var validator = new Validator()
                .Must("accommodationTypeId", cmd.AccommodationTypeId != Guid.Empty, "accommodationTypeId zorunludur.")
                .Must("pricePerPerson", cmd.PricePerPerson > 0, "pricePerPerson 0'dan büyük olmalı.");

            AccommodationType? type = null;
            if (cmd.AccommodationTypeId != Guid.Empty)
            {
                type = await db.AccommodationTypes.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == cmd.AccommodationTypeId && x.IsActive, ct);

                if (type is null)
                    validator.AddError("accommodationTypeId", "Konaklama tipi bulunamadı veya pasif.");
            }

            if (!validator.IsValid) return validator.ToFailure<AccommodationPriceDto>();

            if (await db.CultureTourAccommodationPrices.AnyAsync(
                    x => x.CultureTourId == tourId && x.AccommodationTypeId == type!.Id, ct))
                return Result<AccommodationPriceDto>.Fail(
                    Error.Conflict("Bu tur için bu konaklama tipinin fiyatı zaten tanımlı."));

            var price = new CultureTourAccommodationPrice
            {
                CultureTourId = tourId,
                AccommodationTypeId = type!.Id,
                PricePerPerson = cmd.PricePerPerson,
                IsActive = cmd.IsActive ?? true
            };

            db.CultureTourAccommodationPrices.Add(price);
            await db.SaveChangesAsync(ct);

            return Result<AccommodationPriceDto>.Success(AccommodationPriceDto.From(price, type));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/culture-tours/{tourId:guid}/accommodation-prices",
                async (Guid tourId, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(tourId, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}