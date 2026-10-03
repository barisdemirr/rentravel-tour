using System.Text.Json.Serialization;

namespace Rentravel.Domain.ValueObjects;

public sealed record LocalizedText
{
    [JsonPropertyName("tr")] public string Tr { get; init; } = "";
    [JsonPropertyName("en")] public string? En { get; init; }
    [JsonPropertyName("ar")] public string? Ar { get; init; }

    // Dokümandaki fallback kuralı: field[lang] ?? field.tr
    public string Get(string lang) => lang switch
    {
        "en" when !string.IsNullOrWhiteSpace(En) => En!,
        "ar" when !string.IsNullOrWhiteSpace(Ar) => Ar!,
        _ => Tr
    };
}