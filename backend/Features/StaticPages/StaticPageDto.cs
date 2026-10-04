using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Features.StaticPages;

public record StaticPageDto(
    Guid Id, string Slug, LocalizedText Title, LocalizedHtml Content,
    LocalizedText? SeoTitle, LocalizedText? SeoDescription,
    int OrderIndex, bool IsActive, DateTime CreatedAt, DateTime? UpdatedAt)
{
    public static StaticPageDto From(StaticPage p) =>
        new(p.Id, p.Slug, p.Title, p.Content, p.SeoTitle, p.SeoDescription,
            p.OrderIndex, p.IsActive, p.CreatedAt, p.UpdatedAt);
}

// Admin listesi için hafif sürüm (içerik yok)
public record StaticPageListItemDto(
    Guid Id, string Slug, LocalizedText Title, int OrderIndex, bool IsActive, DateTime? UpdatedAt)
{
    public static StaticPageListItemDto From(StaticPage p) =>
        new(p.Id, p.Slug, p.Title, p.OrderIndex, p.IsActive, p.UpdatedAt);
}

// Footer bağlantıları için public liste
public record StaticPageLinkDto(string Slug, LocalizedText Title);