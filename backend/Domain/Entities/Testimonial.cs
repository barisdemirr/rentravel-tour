using Rentravel.Domain.Enums;

namespace Rentravel.Domain.Entities;

public class Testimonial : BaseEntity
{
    public string Name { get; set; } = "";
    public string Initials { get; set; } = "";
    public ReviewLanguage Lang { get; set; } = ReviewLanguage.TR;
    public string Text { get; set; } = "";            // orijinal yorum, çevrilmez
    public int? Rating { get; set; }                  // 1-5, opsiyonel
}