using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.Vehicles;

// Create ve Update aynı gövdeyi kullanır
public record VehicleInput(
    string? Slug,
    Guid? SegmentId,
    LocalizedText Name,
    LocalizedText? Tagline,
    LocalizedHtml? Description,
    MediaItem? Image,
    List<MediaItem>? Gallery,
    LocalizedText? Badge,
    string? BadgeTone,
    string? Rating,
    LocalizedText? Guarantee,
    List<SpecItem>? Specs,
    List<SpecItem>? DetailedSpecs,
    DeliveryBlock? Delivery,
    DeliveryBlock? Office,
    List<DriverRequirement>? DriverRequirements,
    decimal Deposit,
    int? KmLimit,
    decimal? ExtraKmPrice,
    List<Guid>? ExtraIds,
    LocalizedText? SeoTitle,
    LocalizedText? SeoDescription,
    LocalizedText? SeoKeywords,
    MediaItem? OgImage,
    decimal DefaultDailyPrice,
    Currency? Currency,
    bool IsFeatured,
    bool IsActive,
    int OrderIndex);