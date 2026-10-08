using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class HeroSlideConfiguration : IEntityTypeConfiguration<HeroSlide>
{
    public void Configure(EntityTypeBuilder<HeroSlide> builder)
    {
        builder.ToTable("HeroSlides");

        builder.Property(x => x.Image).HasJsonConversion();
        builder.Property(x => x.Title).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();
        builder.Property(x => x.CtaLabel).HasJsonConversion();
        builder.Property(x => x.BadgeText).HasJsonConversion();

        builder.Property(x => x.CtaHref).HasMaxLength(500);
        builder.Property(x => x.Badge).HasMaxLength(80);

        builder.HasIndex(x => new { x.IsActive, x.OrderIndex });
    }
}