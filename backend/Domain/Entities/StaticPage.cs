using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class StaticPage : BaseEntity
{
    public string Slug { get; set; } = "";            // "hakkimizda", "kvkk-aydinlatma"
    public LocalizedText Title { get; set; } = new();
    public LocalizedHtml Content { get; set; } = new();
    public LocalizedText? SeoTitle { get; set; }
    public LocalizedText? SeoDescription { get; set; }
}