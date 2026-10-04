using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.Vehicles;

public record VehicleSegmentRef(Guid Id, string Key, LocalizedText Label, string Icon)
{
    public static VehicleSegmentRef? From(VehicleSegment? s) =>
        s is null ? null : new(s.Id, s.Key, s.Label, s.Icon);
}

public record VehicleDto(
    Guid Id, string Slug, VehicleSegmentRef? Segment,
    LocalizedText Name, LocalizedText? Tagline, LocalizedHtml? Description,
    MediaItem? Image, List<MediaItem> Gallery,
    LocalizedText? Badge, string? BadgeTone, string? Rating, LocalizedText? Guarantee,
    List<SpecItem> Specs, List<SpecItem> DetailedSpecs,
    DeliveryBlock? Delivery, DeliveryBlock? Office, List<DriverRequirement> DriverRequirements,
    decimal Deposit, int? KmLimit, decimal? ExtraKmPrice,
    List<VehicleExtraSnapshot> Extras,
    LocalizedText? SeoTitle, LocalizedText? SeoDescription, LocalizedText? SeoKeywords, MediaItem? OgImage,
    decimal DefaultDailyPrice, Currency Currency, bool IsFeatured, bool IsActive, int OrderIndex)
{
    public static VehicleDto From(Vehicle v) => new(
        v.Id, v.Slug, VehicleSegmentRef.From(v.Segment),
        v.Name, v.Tagline, v.Description,
        v.Image, v.Gallery,
        v.Badge, v.BadgeTone, v.Rating, v.Guarantee,
        v.Specs, v.DetailedSpecs,
        v.Delivery, v.Office, v.DriverRequirements,
        v.Deposit, v.KmLimit, v.ExtraKmPrice,
        v.Extras,
        v.SeoTitle, v.SeoDescription, v.SeoKeywords, v.OgImage,
        v.DefaultDailyPrice, v.Currency, v.IsFeatured, v.IsActive, v.OrderIndex);
}

// Liste kartları için hafif sürüm
public record VehicleListItemDto(
    Guid Id, string Slug, VehicleSegmentRef? Segment,
    LocalizedText Name, LocalizedText? Tagline, MediaItem? Image,
    LocalizedText? Badge, string? BadgeTone, string? Rating, LocalizedText? Guarantee,
    List<SpecItem> Specs, decimal DefaultDailyPrice, Currency Currency,
    bool IsFeatured, bool IsActive, int OrderIndex)
{
    public static VehicleListItemDto From(Vehicle v) => new(
        v.Id, v.Slug, VehicleSegmentRef.From(v.Segment),
        v.Name, v.Tagline, v.Image,
        v.Badge, v.BadgeTone, v.Rating, v.Guarantee,
        v.Specs, v.DefaultDailyPrice, v.Currency,
        v.IsFeatured, v.IsActive, v.OrderIndex);
}