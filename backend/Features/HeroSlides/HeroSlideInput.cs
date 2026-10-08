using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.HeroSlides;

public record HeroSlideInput
{
    public MediaItem? Image { get; init; }
    public LocalizedText? Title { get; init; }
    public LocalizedText? Description { get; init; }
    public LocalizedText? CtaLabel { get; init; }
    public string? CtaHref { get; init; }
    public string? Badge { get; init; }
    public LocalizedText? BadgeText { get; init; }
    public bool IsActive { get; init; } = true;
    public int OrderIndex { get; init; }
}