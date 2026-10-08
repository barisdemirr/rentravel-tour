using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.HeroSlides;

public record HeroSlideDto(
    Guid Id,
    MediaItem? Image,
    LocalizedText Title,
    LocalizedText? Description,
    LocalizedText? CtaLabel,
    string? CtaHref,
    string? Badge,
    LocalizedText? BadgeText,
    bool IsActive,
    int OrderIndex)
{
    public static HeroSlideDto From(HeroSlide s) => new(
        s.Id, s.Image, s.Title, s.Description, s.CtaLabel,
        s.CtaHref, s.Badge, s.BadgeText, s.IsActive, s.OrderIndex);
}