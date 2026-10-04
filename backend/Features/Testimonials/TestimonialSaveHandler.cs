using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Testimonials;

public record TestimonialInput
{
    public string? Name { get; init; }
    public string? Initials { get; init; }
    public ReviewLanguage? Lang { get; init; }
    public string? Text { get; init; }
    public int? Rating { get; init; }
    public int OrderIndex { get; init; }
    public bool? IsActive { get; init; }
}

public class TestimonialSaveHandler(AppDbContext db)
{
    public async Task<Result<TestimonialDto>> Save(Testimonial? existing, TestimonialInput input, CancellationToken ct)
    {
        var name = input.Name?.Trim() ?? "";
        var text = input.Text?.Trim() ?? "";
        var initials = string.IsNullOrWhiteSpace(input.Initials)
            ? MakeInitials(name)
            : input.Initials.Trim().ToUpperInvariant();

        var validator = new Validator()
            .Required("name", name).MaxLength("name", name, 100)
            .Required("text", text).MaxLength("text", text, 2000)
            .MaxLength("initials", initials, 5)
            .Must("lang", input.Lang is { } l && Enum.IsDefined(l), "lang zorunlu ve geçerli olmalı (TR, EN, AR, DE).")
            .Must("rating", input.Rating is null or (>= 1 and <= 5), "rating 1 ile 5 arasında olmalı.");

        if (!validator.IsValid) return validator.ToFailure<TestimonialDto>();

        var testimonial = existing ?? new Testimonial();

        testimonial.Name = name;
        testimonial.Initials = initials;
        testimonial.Lang = input.Lang!.Value;
        testimonial.Text = text;
        testimonial.Rating = input.Rating;
        testimonial.OrderIndex = input.OrderIndex;
        testimonial.IsActive = input.IsActive ?? existing?.IsActive ?? true;

        if (existing is null) db.Testimonials.Add(testimonial);
        await db.SaveChangesAsync(ct);

        return Result<TestimonialDto>.Success(TestimonialDto.From(testimonial));
    }

    // "Gizem Barış" -> "GB", "Ahmet Ali Veli" -> "AV", tek kelime -> tek harf
    private static string MakeInitials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return parts.Length switch
        {
            0 => "",
            1 => char.ToUpperInvariant(parts[0][0]).ToString(),
            _ => string.Concat(char.ToUpperInvariant(parts[0][0]), char.ToUpperInvariant(parts[^1][0]))
        };
    }
}