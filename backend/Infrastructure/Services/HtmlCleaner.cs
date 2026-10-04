using Ganss.Xss;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Infrastructure.Services;

// Admin'den gelen HTML'i kaydetmeden önce temizler: <script>, onclick gibi olay özellikleri,
// javascript: bağlantıları ve iframe gibi tehlikeli kısımlar atılır. Paragraf, başlık, liste,
// bağlantı ve görsel gibi normal biçimlendirme korunur.
public class HtmlCleaner
{
    public string Clean(string? html)
    {
        if (string.IsNullOrWhiteSpace(html)) return "";
        return new HtmlSanitizer().Sanitize(html);
    }

    public LocalizedHtml? Clean(LocalizedHtml? html) =>
        html is null
            ? null
            : new LocalizedHtml
            {
                Tr = Clean(html.Tr),
                En = html.En is null ? null : Clean(html.En),
                Ar = html.Ar is null ? null : Clean(html.Ar)
            };
}