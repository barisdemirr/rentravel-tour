using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.Tours;

public record TourCategoryRef(Guid Id, string Key, LocalizedText Label, string Icon)
{
    public static TourCategoryRef? From(TourCategory? c) =>
        c is null ? null : new(c.Id, c.Key, c.Label, c.Icon);
}

// Tam detay. Kültür turu bunu miras alıp Nights ekler.
public record TourDto
{
    public TourDto() { }

    protected TourDto(TourBase t)
    {
        Id = t.Id;
        Slug = t.Slug;
        Category = TourCategoryRef.From(t.Category);
        Title = t.Title;
        Description = t.Description;
        LongDescription = t.LongDescription;
        Image = t.Image;
        Gallery = t.Gallery;
        Badge = t.Badge;
        BadgeTone = t.BadgeTone;
        Duration = t.Duration;
        Transport = t.Transport;
        TransportIcon = t.TransportIcon;
        Badges = t.Badges;
        RoutePills = t.RoutePills;
        QuickSpecs = t.QuickSpecs;
        Editorial = t.Editorial;
        Itinerary = t.Itinerary;
        Inclusions = t.Inclusions;
        TravelNotes = t.TravelNotes;
        SeatsTotal = t.SeatsTotal;
        SeoTitle = t.SeoTitle;
        SeoDescription = t.SeoDescription;
        SeoKeywords = t.SeoKeywords;
        OgImage = t.OgImage;
        DefaultBasePrice = t.DefaultBasePrice;
        Currency = t.Currency;
        IsFeatured = t.IsFeatured;
        IsActive = t.IsActive;
        OrderIndex = t.OrderIndex;
    }

    public static TourDto From(TourBase t) => new(t);

    public Guid Id { get; init; }
    public string Slug { get; init; } = "";
    public TourCategoryRef? Category { get; init; }
    public LocalizedText Title { get; init; } = new();
    public LocalizedText? Description { get; init; }
    public LocalizedHtml? LongDescription { get; init; }
    public MediaItem? Image { get; init; }
    public List<MediaItem> Gallery { get; init; } = [];
    public LocalizedText? Badge { get; init; }
    public string? BadgeTone { get; init; }
    public string? Duration { get; init; }
    public LocalizedText? Transport { get; init; }
    public string? TransportIcon { get; init; }
    public List<BadgeItem> Badges { get; init; } = [];
    public List<RoutePill> RoutePills { get; init; } = [];
    public List<FeatureItem> QuickSpecs { get; init; } = [];
    public EditorialBlock? Editorial { get; init; }
    public List<ItineraryItem> Itinerary { get; init; } = [];
    public InclusionsBlock? Inclusions { get; init; }
    public List<ListItem> TravelNotes { get; init; } = [];
    public int SeatsTotal { get; init; }
    public LocalizedText? SeoTitle { get; init; }
    public LocalizedText? SeoDescription { get; init; }
    public LocalizedText? SeoKeywords { get; init; }
    public MediaItem? OgImage { get; init; }
    public decimal DefaultBasePrice { get; init; }
    public Currency Currency { get; init; }
    public bool IsFeatured { get; init; }
    public bool IsActive { get; init; }
    public int OrderIndex { get; init; }
}

// Liste kartları için hafif sürüm
public record TourListItemDto
{
    public TourListItemDto() { }

    protected TourListItemDto(TourBase t)
    {
        Id = t.Id;
        Slug = t.Slug;
        Category = TourCategoryRef.From(t.Category);
        Title = t.Title;
        Description = t.Description;
        Image = t.Image;
        Badge = t.Badge;
        BadgeTone = t.BadgeTone;
        Duration = t.Duration;
        Transport = t.Transport;
        TransportIcon = t.TransportIcon;
        DefaultBasePrice = t.DefaultBasePrice;
        Currency = t.Currency;
        IsFeatured = t.IsFeatured;
        IsActive = t.IsActive;
        OrderIndex = t.OrderIndex;
    }

    public static TourListItemDto From(TourBase t) => new(t);

    public Guid Id { get; init; }
    public string Slug { get; init; } = "";
    public TourCategoryRef? Category { get; init; }
    public LocalizedText Title { get; init; } = new();
    public LocalizedText? Description { get; init; }
    public MediaItem? Image { get; init; }
    public LocalizedText? Badge { get; init; }
    public string? BadgeTone { get; init; }
    public string? Duration { get; init; }
    public LocalizedText? Transport { get; init; }
    public string? TransportIcon { get; init; }
    public decimal DefaultBasePrice { get; init; }
    public Currency Currency { get; init; }
    public bool IsFeatured { get; init; }
    public bool IsActive { get; init; }
    public int OrderIndex { get; init; }
}