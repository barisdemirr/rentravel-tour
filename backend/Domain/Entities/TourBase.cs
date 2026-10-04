using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

// DailyTour ve CultureTour'un ortak alanları. Kendi tablosu yok, alanlar her iki tabloya yansır.
public abstract class TourBase : BaseEntity
{
    public string Slug { get; set; } = "";
    public Guid? CategoryId { get; set; }
    public TourCategory? Category { get; set; }

    // Çok dilli içerik
    public LocalizedText Title { get; set; } = new();
    public LocalizedText? Description { get; set; }          // kart açıklaması
    public LocalizedHtml? LongDescription { get; set; }      // detay sayfası

    // Medya: kapak + galeri
    public MediaItem? Image { get; set; }
    public List<MediaItem> Gallery { get; set; } = [];

    // Vitrin
    public LocalizedText? Badge { get; set; }
    public string? BadgeTone { get; set; }

    // Kart bilgileri
    public string? Duration { get; set; }                    // "09:30 - 18:30"
    public LocalizedText? Transport { get; set; }            // "Trabzon" / "Maçka"
    public string? TransportIcon { get; set; }

    // Detay sayfası
    public List<BadgeItem> Badges { get; set; } = [];
    public List<RoutePill> RoutePills { get; set; } = [];
    public List<FeatureItem> QuickSpecs { get; set; } = [];
    public EditorialBlock? Editorial { get; set; }
    public List<ItineraryItem> Itinerary { get; set; } = [];
    public InclusionsBlock? Inclusions { get; set; }
    public List<ListItem> TravelNotes { get; set; } = [];

    // Rezervasyon: varsayılan kontenjan (seans bazlı kontenjan TourSessions'ta)
    public int SeatsTotal { get; set; }

    // SEO
    public LocalizedText? SeoTitle { get; set; }
    public LocalizedText? SeoDescription { get; set; }
    public LocalizedText? SeoKeywords { get; set; }
    public MediaItem? OgImage { get; set; }

    // Fiyat: kişi başı (yetişkin). Tarihe ve yaşa göre kurallar ayrı tablolarda.
    public decimal DefaultBasePrice { get; set; }
    public Currency Currency { get; set; } = Currency.TRY;

    public bool IsFeatured { get; set; }
}