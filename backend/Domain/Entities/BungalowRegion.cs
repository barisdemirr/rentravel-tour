using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class BungalowRegion : BaseEntity
{
    public string Key { get; set; } = "";
    public LocalizedText ShortLabel { get; set; } = new();
    public LocalizedText FullLabel { get; set; } = new();
    public MediaItem? Thumbnail { get; set; } // boşsa frontend ilk bungalovun görselini kullanır
}