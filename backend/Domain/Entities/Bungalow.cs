using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class Bungalow : BaseEntity
{
    public string Slug { get; set; } = "";
    public Guid? RegionId { get; set; }
    public BungalowRegion? Region { get; set; }

    // Çok dilli içerik
    public LocalizedText Title { get; set; } = new();
    public LocalizedText? Description { get; set; }          // kart açıklaması
    public LocalizedHtml? LongDescription { get; set; }      // detay sayfası
    public LocalizedText? Location { get; set; }

    // Medya: kapak + galeri
    public MediaItem? Image { get; set; }
    public List<MediaItem> Gallery { get; set; } = [];

    // Kahvaltı
    public bool BreakfastIncluded { get; set; }
    public LocalizedText? BreakfastNote { get; set; }
    public BreakfastCard? BreakfastCard { get; set; }

    // Kart
    public LocalizedText? Capacity { get; set; }             // "2-4 Kişilik"
    public List<SpecItem> Amenities { get; set; } = [];      // kart üstü 3-4 ikon

    // Detay sayfası
    public List<FeatureItem> FeatureStrip { get; set; } = [];
    public List<SpecItem> DetailedAmenities { get; set; } = [];
    public List<DistanceItem> Distances { get; set; } = [];
    public LocalizedText? LocationNote { get; set; }
    public List<RuleItem> Rules { get; set; } = [];

    // Puanlama (opsiyonel)
    public LocalizedText? RatingLabel { get; set; }          // "Mükemmel"
    public decimal? RatingScore { get; set; }
    public int? RatingCount { get; set; }

    // SEO
    public LocalizedText? SeoTitle { get; set; }
    public LocalizedText? SeoDescription { get; set; }
    public LocalizedText? SeoKeywords { get; set; }
    public MediaItem? OgImage { get; set; }

    // Fiyat: gecelik, bungalov başına. Tarihe ve yaşa göre kurallar ayrı tablolarda.
    public decimal DefaultPricePerNight { get; set; }
    public Currency Currency { get; set; } = Currency.TRY;

    public bool IsFeatured { get; set; }
}