using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.AccommodationPrices;

public record AccommodationTypeRef(Guid Id, string Key, LocalizedText Label, string? Icon)
{
    public static AccommodationTypeRef? From(AccommodationType? t) =>
        t is null ? null : new(t.Id, t.Key, t.Label, t.Icon);
}

public record AccommodationPriceDto(
    Guid Id, Guid CultureTourId, AccommodationTypeRef? AccommodationType,
    decimal PricePerPerson, bool IsActive, DateTime CreatedAt)
{
    public static AccommodationPriceDto From(CultureTourAccommodationPrice p, AccommodationType? type) =>
        new(p.Id, p.CultureTourId, AccommodationTypeRef.From(type), p.PricePerPerson, p.IsActive, p.CreatedAt);
}