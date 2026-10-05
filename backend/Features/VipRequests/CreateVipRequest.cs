using System.Text;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.VipRequests;

public static class CreateVipRequest
{
    /// <param name="Website">Tuzak alan: botlar doldurur, insanlar görmez.</param>
    public record Command(string? FullName, string? Phone, string? Message, string? Locale, string? Website);

    public class Handler(MailService mail, ILogger<Handler> logger)
    {
        private static readonly Dictionary<string, string> LanguageNames = new()
        {
            ["tr"] = "Türkçe",
            ["en"] = "İngilizce",
            ["ar"] = "Arapça",
        };

        public async Task<Result<object>> Handle(Command cmd, CancellationToken ct)
        {
            // Tuzak alan doluysa sessizce başarılı dön: bot uğraşmaya devam etmesin
            if (!string.IsNullOrWhiteSpace(cmd.Website))
            {
                logger.LogInformation("VIP talebi tuzak alana takıldı.");
                return Result<object>.Success(new { });
            }

            var fullName = (cmd.FullName ?? "").Trim();
            var phone = (cmd.Phone ?? "").Trim();
            var message = (cmd.Message ?? "").Trim();

            var validator = new Validator()
                .Required("fullName", fullName).MaxLength("fullName", fullName, 120)
                .Required("phone", phone).MaxLength("phone", phone, 30)
                .Required("message", message).MaxLength("message", message, 2000);

            if (fullName.Length is > 0 and < 3)
                validator.Add("fullName", "Ad soyad en az 3 karakter olmalıdır.");

            // Sadece rakamları say: +90 (850) 309 61 00 gibi yazımlar da geçerli
            var digits = phone.Count(char.IsDigit);
            if (phone.Length > 0 && digits is < 10 or > 15)
                validator.Add("phone", "Geçerli bir telefon numarası girin.");

            if (message.Length is > 0 and < 10)
                validator.Add("message", "Talebinizi biraz daha açıklayın.");

            if (!validator.IsValid) return validator.ToFailure<object>();

            var locale = cmd.Locale is "en" or "ar" ? cmd.Locale : "tr";
            var language = LanguageNames.GetValueOrDefault(locale, "Türkçe");

            var subject = $"Yeni VIP talebi: {fullName}";

            var body = new StringBuilder()
                .AppendLine("Web sitesindeki VIP talep formundan yeni bir kayıt alındı.")
                .AppendLine()
                .AppendLine($"Ad soyad: {fullName}")
                .AppendLine($"Telefon: {phone}")
                .AppendLine($"Form dili: {language}")
                .AppendLine($"Tarih: {DateTime.Now:dd.MM.yyyy HH:mm}")
                .AppendLine()
                .AppendLine("Talep:")
                .AppendLine(message)
                .AppendLine()
                .AppendLine("---")
                .AppendLine("Rentravel Turizm web sitesi")
                .ToString();

            var sent = await mail.SendAsync(subject, body, ct);

            if (!sent)
                return Result<object>.Fail(Error.Unexpected(
                    "Talebiniz şu anda iletilemedi. Lütfen WhatsApp veya telefonla bize ulaşın."));

            logger.LogInformation("VIP talebi iletildi: {Name}", fullName);
            return Result<object>.Success(new { });
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/vip-requests",
                    async (Command cmd, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(cmd, ct)).ToHttp(_ => Results.Ok(new { ok = true })))
                .AllowAnonymous()
                .RequireRateLimiting("vip");
    }
}