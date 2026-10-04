using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;

namespace Rentravel.Features.TourSessions;

public record TourSessionDto(
    Guid Id, TourType TourType, Guid TourId, DateOnly Date, int Seats,
    decimal? PriceOverride, bool IsActive, DateTime CreatedAt)
{
    public static TourSessionDto From(TourSession s) =>
        new(s.Id, s.TourType, s.TourId, s.Date, s.Seats, s.PriceOverride, s.IsActive, s.CreatedAt);
}