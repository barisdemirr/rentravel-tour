using Rentravel.Domain.Entities;
using Rentravel.Features.Tours;

namespace Rentravel.Features.CultureTours;

public record CultureTourDto : TourDto
{
    public CultureTourDto() { }

    public CultureTourDto(CultureTour t) : base(t)
    {
        Nights = t.Nights;
    }

    public static CultureTourDto From(CultureTour t) => new(t);

    public int Nights { get; init; }
}

public record CultureTourListItemDto : TourListItemDto
{
    public CultureTourListItemDto() { }

    public CultureTourListItemDto(CultureTour t) : base(t)
    {
        Nights = t.Nights;
    }

    public static CultureTourListItemDto From(CultureTour t) => new(t);

    public int Nights { get; init; }
}