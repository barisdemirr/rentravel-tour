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
    public LocalizedText? Description { get; set; }
    public LocalizedHtml? LongDescription { get; set; }
    public LocalizedText? Location { get; set; }

    // Medya
    public MediaItem? Image { get; set; }
    public List<MediaItem> Gallery { get; set; } = [];

    // Kahvaltı
    public bool BreakfastIncluded { get; set; }
    public LocalizedText? BreakfastNote { get; set; }
    public BreakfastCard? BreakfastCard { get; set; }

    // Kart
    public LocalizedText? Capacity { get; set; }
    public List<SpecItem> Amenities { get; set; } = [];

    // Detay sayfası
    public List<FeatureItem> FeatureStrip { get; set; } = [];
    public List<SpecItem> DetailedAmenities { get; set; } = [];
    public List<DistanceItem> Distances { get; set; } = [];
    public LocalizedText? LocationNote { get; set; }
    public List<RuleItem> Rules { get; set; } = [];

    // Katalogdan kopyalanan ekstra hizmetler (snapshot)
    public List<BungalowExtraSnapshot> Extras { get; set; } = [];

    // Puanlama
    public LocalizedText? RatingLabel { get; set; }
    public decimal? RatingScore { get; set; }
    public int? RatingCount { get; set; }

    // SEO
    public LocalizedText? SeoTitle { get; set; }
    public LocalizedText? SeoDescription { get; set; }
    public LocalizedText? SeoKeywords { get; set; }
    public MediaItem? OgImage { get; set; }

    // Fiyat
    public decimal DefaultPricePerNight { get; set; }
    public Currency Currency { get; set; } = Currency.TRY;

    // Kapasite ve ekstra ücret
    public int StandardCapacity { get; set; } = 2;               // fiyata dahil kişi sayısı
    public int MaxCapacity { get; set; } = 2;                    // toplam üst sınır (yetişkin + çocuk)
    public decimal ExtraAdultPricePerNight { get; set; } = 0m;   // standart üstü yetişkin başına gecelik

    public bool IsFeatured { get; set; }
}