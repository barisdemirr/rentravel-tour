using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.SiteSettings;

public static class UpdateSiteSettings
{
    // Bu değerler sayfaya script olarak gömüleceği için sıkı karakter kümeleri
    private static readonly Regex IdPattern = new("^[A-Za-z0-9_-]+$", RegexOptions.Compiled);
    private static readonly Regex NumberPattern = new("^[0-9]+$", RegexOptions.Compiled);

    public record Command(
        string? GoogleAnalyticsId, string? SearchConsoleToken, string? FacebookPixelId,
        string? YandexMetrikaId, string? RobotsTxtContent);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<SiteSettingsDto>> Handle(Command cmd, CancellationToken ct)
        {
            var googleAnalyticsId = Clean(cmd.GoogleAnalyticsId);
            var searchConsoleToken = Clean(cmd.SearchConsoleToken);
            var facebookPixelId = Clean(cmd.FacebookPixelId);
            var yandexMetrikaId = Clean(cmd.YandexMetrikaId);
            var robots = string.IsNullOrWhiteSpace(cmd.RobotsTxtContent) ? null : cmd.RobotsTxtContent.Trim();

            var validator = new Validator()
                .MaxLength("googleAnalyticsId", googleAnalyticsId, 50)
                .MaxLength("searchConsoleToken", searchConsoleToken, 100)
                .MaxLength("facebookPixelId", facebookPixelId, 50)
                .MaxLength("yandexMetrikaId", yandexMetrikaId, 50)
                .MaxLength("robotsTxtContent", robots, 5000)
                .Must("googleAnalyticsId", googleAnalyticsId is null || IdPattern.IsMatch(googleAnalyticsId),
                      "googleAnalyticsId sadece harf, rakam, tire ve alt çizgi içerebilir (örn: G-XXXXXXXXXX).")
                .Must("searchConsoleToken", searchConsoleToken is null || IdPattern.IsMatch(searchConsoleToken),
                      "searchConsoleToken sadece harf, rakam, tire ve alt çizgi içerebilir.")
                .Must("facebookPixelId", facebookPixelId is null || NumberPattern.IsMatch(facebookPixelId),
                      "facebookPixelId sadece rakam içerebilir.")
                .Must("yandexMetrikaId", yandexMetrikaId is null || NumberPattern.IsMatch(yandexMetrikaId),
                      "yandexMetrikaId sadece rakam içerebilir.");

            if (!validator.IsValid) return validator.ToFailure<SiteSettingsDto>();

            var settings = await db.SiteSettings.FirstOrDefaultAsync(x => x.Id == SiteSetting.SingletonId, ct);

            if (settings is null)
            {
                settings = new SiteSetting { Id = SiteSetting.SingletonId };
                db.SiteSettings.Add(settings);
            }

            settings.GoogleAnalyticsId = googleAnalyticsId;
            settings.SearchConsoleToken = searchConsoleToken;
            settings.FacebookPixelId = facebookPixelId;
            settings.YandexMetrikaId = yandexMetrikaId;
            settings.RobotsTxtContent = robots;

            await db.SaveChangesAsync(ct);

            return Result<SiteSettingsDto>.Success(SiteSettingsDto.From(settings));
        }

        private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/site-settings",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}