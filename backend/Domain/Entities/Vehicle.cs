using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class Vehicle : BaseEntity
{
    public string Slug { get; set; } = "";
    public Guid? SegmentId { get; set; }
    public VehicleSegment? Segment { get; set; }

    // Çok dilli içerik
    public LocalizedText Name { get; set; } = new();
    public LocalizedText? Tagline { get; set; }
    public LocalizedHtml? Description { get; set; }

    // Medya: kapak + galeri
    public MediaItem? Image { get; set; }
    public List<MediaItem> Gallery { get; set; } = [];

    // Vitrin
    public LocalizedText? Badge { get; set; }
    public string? BadgeTone { get; set; }
    public string? Rating { get; set; }
    public LocalizedText? Guarantee { get; set; }

    // Kart ve detay özellikleri
    public List<SpecItem> Specs { get; set; } = [];
    public List<SpecItem> DetailedSpecs { get; set; } = [];

    // Teslimat, ofis, sürücü gereksinimleri
    public DeliveryBlock? Delivery { get; set; }
    public DeliveryBlock? Office { get; set; }
    public List<DriverRequirement> DriverRequirements { get; set; } = [];

    // Depozito ve kilometre
    public decimal Deposit { get; set; }
    public int? KmLimit { get; set; }
    public decimal? ExtraKmPrice { get; set; }

    // Katalogdan kopyalanan ekstralar (snapshot)
    public List<VehicleExtraSnapshot> Extras { get; set; } = [];

    // SEO
    public LocalizedText? SeoTitle { get; set; }
    public LocalizedText? SeoDescription { get; set; }
    public LocalizedText? SeoKeywords { get; set; }
    public MediaItem? OgImage { get; set; }

    // Fiyat (tarihe göre kurallar ayrı tabloda, fiyatlandırma aşamasında)
    public decimal DefaultDailyPrice { get; set; }
    public Currency Currency { get; set; } = Currency.TRY;

    public bool IsFeatured { get; set; }
}