using Rentravel.Domain.Entities;

namespace Rentravel.Features.SiteSettings;

public record SiteSettingsDto(
    string? GoogleAnalyticsId, string? SearchConsoleToken, string? FacebookPixelId,
    string? YandexMetrikaId, string? RobotsTxtContent)
{
    // Satır henüz oluşmadıysa hepsi boş
    public static SiteSettingsDto From(SiteSetting? s) => s is null
        ? new(null, null, null, null, null)
        : new(s.GoogleAnalyticsId, s.SearchConsoleToken, s.FacebookPixelId, s.YandexMetrikaId, s.RobotsTxtContent);
}