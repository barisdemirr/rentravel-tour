using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.Bungalows;

public record BungalowInput
{
    public string? Slug { get; init; }
    public Guid? RegionId { get; init; }

    public LocalizedText? Title { get; init; }
    public LocalizedText? Description { get; init; }
    public LocalizedHtml? LongDescription { get; init; }
    public LocalizedText? Location { get; init; }

    public MediaItem? Image { get; init; }
    public List<MediaItem>? Gallery { get; init; }

    public bool BreakfastIncluded { get; init; }
    public LocalizedText? BreakfastNote { get; init; }
    public BreakfastCard? BreakfastCard { get; init; }

    public LocalizedText? Capacity { get; init; }
    public List<SpecItem>? Amenities { get; init; }

    public List<FeatureItem>? FeatureStrip { get; init; }
    public List<SpecItem>? DetailedAmenities { get; init; }
    public List<DistanceItem>? Distances { get; init; }
    public LocalizedText? LocationNote { get; init; }
    public List<RuleItem>? Rules { get; init; }

    public LocalizedText? RatingLabel { get; init; }
    public decimal? RatingScore { get; init; }
    public int? RatingCount { get; init; }

    public LocalizedText? SeoTitle { get; init; }
    public LocalizedText? SeoDescription { get; init; }
    public LocalizedText? SeoKeywords { get; init; }
    public MediaItem? OgImage { get; init; }
    public List<Guid>? ExtraIds { get; init; }

    public decimal DefaultPricePerNight { get; init; }
    public Currency? Currency { get; init; }

    // Kapasite ve ekstra ücret
    public int StandardCapacity { get; init; } = 2;
    public int MaxCapacity { get; init; } = 2;
    public decimal ExtraAdultPricePerNight { get; init; } = 0m;

    public bool IsFeatured { get; init; }
    public bool IsActive { get; init; }
    public int OrderIndex { get; init; }
}