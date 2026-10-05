using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Rentravel.Infrastructure.Services;

public class MailService(IOptions<MailSettings> options, ILogger<MailService> logger)
{
    private readonly MailSettings _settings = options.Value;

    /// <summary>Düz metin e-posta gönderir. Başarısızsa false döner, istisna fırlatmaz.</summary>
    public async Task<bool> SendAsync(string subject, string body, CancellationToken ct = default)
    {
        if (!_settings.IsConfigured)
        {
            logger.LogError("Mail ayarları eksik, gönderim yapılamadı.");
            return false;
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.User));
        message.To.Add(MailboxAddress.Parse(_settings.To));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        try
        {
            using var client = new SmtpClient();

            // Gmail 587 portunda STARTTLS bekler
            await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(_settings.User, _settings.Password, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "E-posta gönderilemedi: {Subject}", subject);
            return false;
        }
    }
}