using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class GetCultureTourAccommodationOptions
{
    public record AccommodationOptionDto(
        Guid AccommodationTypeId, string Key, LocalizedText Label, LocalizedText? Description,
        string? Icon, decimal PricePerPerson);

    public class Handler(AppDbContext db)
    {
        // Rezervasyon formundaki konaklama seçimi: sadece aktif fiyatlı ve aktif tipler
        public async Task<Result<List<AccommodationOptionDto>>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.CultureTours.AsNoTracking()
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            if (tour is null)
                return Result<List<AccommodationOptionDto>>.Fail(Error.NotFound("Tur bulunamadı."));

            var prices = await db.CultureTourAccommodationPrices.AsNoTracking()
                .Include(x => x.AccommodationType)
                .Where(x => x.CultureTourId == tour.Id && x.IsActive
                            && x.AccommodationType != null && x.AccommodationType.IsActive)
                .OrderBy(x => x.AccommodationType!.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            var options = prices
                .Select(p => new AccommodationOptionDto(
                    p.AccommodationTypeId, p.AccommodationType!.Key, p.AccommodationType.Label,
                    p.AccommodationType.Description, p.AccommodationType.Icon, p.PricePerPerson))
                .ToList();

            return Result<List<AccommodationOptionDto>>.Success(options);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/culture-tours/{slug}/accommodation-options",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}