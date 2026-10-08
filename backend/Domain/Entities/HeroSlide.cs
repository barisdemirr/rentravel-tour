using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class HeroSlide : BaseEntity
{
    public MediaItem? Image { get; set; }

    public LocalizedText Title { get; set; } = new();
    public LocalizedText? Description { get; set; }
    public LocalizedText? CtaLabel { get; set; }

    public string? CtaHref { get; set; }         // /konaklamali-turlar/uzungol-turu gibi
    public string? Badge { get; set; }            // üstteki küçük eyebrow etiketi
    public LocalizedText? BadgeText { get; set; } // eyebrow çok dilli olacaksa
}