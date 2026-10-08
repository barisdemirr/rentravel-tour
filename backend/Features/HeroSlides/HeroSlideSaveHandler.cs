using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public class HeroSlideSaveHandler(AppDbContext db, MediaItemResolver media)
{
    public async Task<Result<HeroSlideDto>> Save(HeroSlide? existing, HeroSlideInput input, CancellationToken ct)
    {
        var validator = new Validator()
            .LocalizedRequired("title", input.Title, 200)
            .LocalizedOptional("description", input.Description, 500)
            .LocalizedOptional("ctaLabel", input.CtaLabel, 60)
            .LocalizedOptional("badgeText", input.BadgeText, 80)
            .MaxLength("ctaHref", input.CtaHref, 500)
            .MaxLength("badge", input.Badge, 80);

        // Yayında olacaksa görsel ve tıklanabilir buton için href zorunlu
        if (input.IsActive)
        {
            if (input.Image is null)
                validator.AddError("image", "Yayınlamak için görsel gerekli.");
            if (string.IsNullOrWhiteSpace(input.CtaHref))
                validator.AddError("ctaHref", "Yayınlamak için buton bağlantısı gerekli.");
        }

        var image = await media.ResolveAsync(input.Image, "image", validator, ct);

        if (!validator.IsValid) return validator.ToFailure<HeroSlideDto>();

        var slide = existing ?? new HeroSlide();

        slide.Image = image;
        slide.Title = input.Title!;
        slide.Description = input.Description.OrNull();
        slide.CtaLabel = input.CtaLabel.OrNull();
        slide.CtaHref = string.IsNullOrWhiteSpace(input.CtaHref) ? null : input.CtaHref.Trim();
        slide.Badge = string.IsNullOrWhiteSpace(input.Badge) ? null : input.Badge.Trim();
        slide.BadgeText = input.BadgeText.OrNull();
        slide.IsActive = input.IsActive;
        slide.OrderIndex = input.OrderIndex;

        if (existing is null) db.HeroSlides.Add(slide);
        await db.SaveChangesAsync(ct);

        return Result<HeroSlideDto>.Success(HeroSlideDto.From(slide));
    }
}