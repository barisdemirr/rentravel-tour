using Rentravel.Features.Tours;

namespace Rentravel.Features.CultureTours;

public record CultureTourInput : TourInput
{
    public int Nights { get; init; }
}