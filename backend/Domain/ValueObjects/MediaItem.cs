using System.Text.Json.Serialization;

namespace Rentravel.Domain.ValueObjects;

public sealed record MediaItem
{
    [JsonPropertyName("id")] public Guid Id { get; init; }
    [JsonPropertyName("url")] public string Url { get; init; } = "";
    [JsonPropertyName("alt")] public LocalizedText? Alt { get; init; }
    [JsonPropertyName("order")] public int Order { get; init; }
}