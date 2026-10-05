using System.Text;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.CorporateRequests;

public static class CreateCorporateRequest
{
    /// <param name="Website">Tuzak alan: botlar doldurur, insanlar görmez.</param>
    public record Command(
        string? Company,
        string? ContactName,
        string? Phone,
        string? Email,
        string? StartDate,
        string? EndDate,
        string? VehicleType,
        int Quantity,
        string? Notes,
        string? Locale,
        string? Website);

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
            // Tuzak alan doluysa sessizce başarılı dön
            if (!string.IsNullOrWhiteSpace(cmd.Website))
            {
                logger.LogInformation("Kurumsal talep tuzak alana takıldı.");
                return Result<object>.Success(new { });
            }

            var company = (cmd.Company ?? "").Trim();
            var contactName = (cmd.ContactName ?? "").Trim();
            var phone = (cmd.Phone ?? "").Trim();
            var email = (cmd.Email ?? "").Trim();
            var vehicleType = (cmd.VehicleType ?? "").Trim();
            var notes = (cmd.Notes ?? "").Trim();

            var validator = new Validator()
                .Required("company", company).MaxLength("company", company, 160)
                .Required("contactName", contactName).MaxLength("contactName", contactName, 120)
                .Required("phone", phone).MaxLength("phone", phone, 30)
                .MaxLength("email", email, 160)
                .Required("vehicleType", vehicleType).MaxLength("vehicleType", vehicleType, 80)
                .MaxLength("notes", notes, 2000);

            var digits = phone.Count(char.IsDigit);
            if (phone.Length > 0 && digits is < 10 or > 15)
                validator.Add("phone", "Geçerli bir telefon numarası girin.");

            if (!DateOnly.TryParse(cmd.StartDate, out var start))
                validator.Add("startDate", "Başlangıç tarihi geçersiz.");

            if (!DateOnly.TryParse(cmd.EndDate, out var end))
                validator.Add("endDate", "Bitiş tarihi geçersiz.");

            if (validator.IsValid && end <= start)
                validator.Add("endDate", "Bitiş tarihi başlangıçtan sonra olmalıdır.");

            if (cmd.Quantity is < 1 or > 50)
                validator.Add("quantity", "Araç adedi 1 ile 50 arasında olmalıdır.");

            if (!validator.IsValid) return validator.ToFailure<object>();

            var days = end.DayNumber - start.DayNumber;
            var language = LanguageNames.GetValueOrDefault(cmd.Locale ?? "tr", "Türkçe");

            var subject = $"Kurumsal kiralama talebi: {company}";

            var body = new StringBuilder()
                .AppendLine("Web sitesindeki kurumsal kiralama formundan yeni bir talep alındı.")
                .AppendLine()
                .AppendLine($"Firma: {company}")
                .AppendLine($"Yetkili: {contactName}")
                .AppendLine($"Telefon: {phone}")
                .AppendLine(string.IsNullOrEmpty(email) ? "E-posta: belirtilmedi" : $"E-posta: {email}")
                .AppendLine()
                .AppendLine($"Başlangıç: {start:dd.MM.yyyy}")
                .AppendLine($"Bitiş: {end:dd.MM.yyyy}")
                .AppendLine($"Süre: {days} gün")
                .AppendLine($"Araç tipi: {vehicleType}")
                .AppendLine($"Adet: {cmd.Quantity}")
                .AppendLine()
                .AppendLine(string.IsNullOrEmpty(notes) ? "Not: yok" : $"Not:\n{notes}")
                .AppendLine()
                .AppendLine($"Form dili: {language}")
                .AppendLine($"Tarih: {DateTime.Now:dd.MM.yyyy HH:mm}")
                .AppendLine()
                .AppendLine("---")
                .AppendLine("Rentravel Turizm web sitesi")
                .ToString();

            var sent = await mail.SendAsync(subject, body, ct);

            if (!sent)
                return Result<object>.Fail(Error.Unexpected(
                    "Talebiniz şu anda iletilemedi. Lütfen WhatsApp veya telefonla bize ulaşın."));

            logger.LogInformation("Kurumsal talep iletildi: {Company}", company);
            return Result<object>.Success(new { });
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/corporate-requests",
                    async (Command cmd, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(cmd, ct)).ToHttp(_ => Results.Ok(new { ok = true })))
                .AllowAnonymous()
                .RequireRateLimiting("vip"); // VIP ile aynı sınır: dakikada 3
    }
}