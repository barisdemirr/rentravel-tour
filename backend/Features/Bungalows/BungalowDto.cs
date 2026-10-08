using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.Bungalows;

public record BungalowRegionRef(Guid Id, string Key, LocalizedText ShortLabel, LocalizedText FullLabel)
{
    public static BungalowRegionRef? From(BungalowRegion? r) =>
        r is null ? null : new(r.Id, r.Key, r.ShortLabel, r.FullLabel);
}

public record BungalowDto(
    Guid Id, string Slug, BungalowRegionRef? Region,
    LocalizedText Title, LocalizedText? Description, LocalizedHtml? LongDescription, LocalizedText? Location,
    MediaItem? Image, List<MediaItem> Gallery,
    bool BreakfastIncluded, LocalizedText? BreakfastNote, BreakfastCard? BreakfastCard,
    LocalizedText? Capacity, List<SpecItem> Amenities,
    List<FeatureItem> FeatureStrip, List<SpecItem> DetailedAmenities, List<DistanceItem> Distances,
    LocalizedText? LocationNote, List<RuleItem> Rules,
    List<BungalowExtraSnapshot> Extras,                        // ← YENİ
    LocalizedText? RatingLabel, decimal? RatingScore, int? RatingCount,
    LocalizedText? SeoTitle, LocalizedText? SeoDescription, LocalizedText? SeoKeywords, MediaItem? OgImage,
    decimal DefaultPricePerNight, Currency Currency,
    int StandardCapacity, int MaxCapacity, decimal ExtraAdultPricePerNight,
    bool IsFeatured, bool IsActive, int OrderIndex)
{
    public static BungalowDto From(Bungalow b) => new(
        b.Id, b.Slug, BungalowRegionRef.From(b.Region),
        b.Title, b.Description, b.LongDescription, b.Location,
        b.Image, b.Gallery,
        b.BreakfastIncluded, b.BreakfastNote, b.BreakfastCard,
        b.Capacity, b.Amenities,
        b.FeatureStrip, b.DetailedAmenities, b.Distances,
        b.LocationNote, b.Rules,
        b.Extras ?? [],                                         
        b.RatingLabel, b.RatingScore, b.RatingCount,
        b.SeoTitle, b.SeoDescription, b.SeoKeywords, b.OgImage,
        b.DefaultPricePerNight, b.Currency,
        b.StandardCapacity, b.MaxCapacity, b.ExtraAdultPricePerNight,
        b.IsFeatured, b.IsActive, b.OrderIndex);
}

// Liste kartları için hafif sürüm
public record BungalowListItemDto(
    Guid Id, string Slug, BungalowRegionRef? Region,
    LocalizedText Title, LocalizedText? Description, LocalizedText? Location,
    MediaItem? Image, LocalizedText? Capacity, List<SpecItem> Amenities, bool BreakfastIncluded,
    LocalizedText? RatingLabel, decimal? RatingScore, int? RatingCount,
    decimal DefaultPricePerNight, Currency Currency,
    int StandardCapacity, int MaxCapacity,
    bool IsFeatured, bool IsActive, int OrderIndex)
{
    public static BungalowListItemDto From(Bungalow b) => new(
        b.Id, b.Slug, BungalowRegionRef.From(b.Region),
        b.Title, b.Description, b.Location,
        b.Image, b.Capacity, b.Amenities, b.BreakfastIncluded,
        b.RatingLabel, b.RatingScore, b.RatingCount,
        b.DefaultPricePerNight, b.Currency,
        b.StandardCapacity, b.MaxCapacity,
        b.IsFeatured, b.IsActive, b.OrderIndex);
}