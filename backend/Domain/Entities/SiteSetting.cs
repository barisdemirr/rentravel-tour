namespace Rentravel.Domain.Entities;

// Tek satırlık site ayarları. Her zaman SingletonId ile erişilir.
public class SiteSetting : BaseEntity
{
    public static readonly Guid SingletonId = new("5e7a0c1d-3b2f-4c8e-9a61-2d4f6b8c0e11");

    public string? GoogleAnalyticsId { get; set; }
    public string? SearchConsoleToken { get; set; }
    public string? FacebookPixelId { get; set; }
    public string? YandexMetrikaId { get; set; }
    public string? RobotsTxtContent { get; set; }
}