using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.Tours;

public record TourInput
{
    public string? Slug { get; init; }
    public Guid? CategoryId { get; init; }

    public LocalizedText? Title { get; init; }
    public LocalizedText? Description { get; init; }
    public LocalizedHtml? LongDescription { get; init; }

    public MediaItem? Image { get; init; }
    public List<MediaItem>? Gallery { get; init; }

    public LocalizedText? Badge { get; init; }
    public string? BadgeTone { get; init; }

    public string? Duration { get; init; }
    public LocalizedText? Transport { get; init; }
    public string? TransportIcon { get; init; }

    public List<BadgeItem>? Badges { get; init; }
    public List<RoutePill>? RoutePills { get; init; }
    public List<FeatureItem>? QuickSpecs { get; init; }
    public EditorialBlock? Editorial { get; init; }
    public List<ItineraryItem>? Itinerary { get; init; }
    public InclusionsBlock? Inclusions { get; init; }
    public List<ListItem>? TravelNotes { get; init; }

    public int SeatsTotal { get; init; }

    public LocalizedText? SeoTitle { get; init; }
    public LocalizedText? SeoDescription { get; init; }
    public LocalizedText? SeoKeywords { get; init; }
    public MediaItem? OgImage { get; init; }

    public decimal DefaultBasePrice { get; init; }
    public Currency? Currency { get; init; }

    public bool IsFeatured { get; init; }
    public bool IsActive { get; init; }
    public int OrderIndex { get; init; }
}