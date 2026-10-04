using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;

namespace Rentravel.Features.Testimonials;

public record TestimonialDto(
    Guid Id, string Name, string Initials, ReviewLanguage Lang, string Dir,
    string Text, int? Rating, int OrderIndex, bool IsActive)
{
    public static TestimonialDto From(Testimonial t) => new(
        t.Id, t.Name, t.Initials, t.Lang,
        t.Lang == ReviewLanguage.AR ? "rtl" : "ltr",
        t.Text, t.Rating, t.OrderIndex, t.IsActive);
}