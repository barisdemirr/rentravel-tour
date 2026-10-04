namespace Rentravel.Domain.ValueObjects;

// LocalizedText ile aynı şekil, ama içerik HTML. Ayrı tip olması, HTML alanlarını
// ileride temizleme (sanitize) adımına bağlamayı kolaylaştırır.
public sealed record LocalizedHtml
{
    public string Tr { get; init; } = "";
    public string? En { get; init; }
    public string? Ar { get; init; }

    public string Get(string lang) => lang switch
    {
        "en" when !string.IsNullOrWhiteSpace(En) => En!,
        "ar" when !string.IsNullOrWhiteSpace(Ar) => Ar!,
        _ => Tr
    };
}