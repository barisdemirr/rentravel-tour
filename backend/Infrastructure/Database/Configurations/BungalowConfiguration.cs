using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class BungalowConfiguration : IEntityTypeConfiguration<Bungalow>
{
    public void Configure(EntityTypeBuilder<Bungalow> builder)
    {
        builder.ToTable("Bungalows");

        builder.Property(x => x.Slug).HasMaxLength(100).IsRequired();

        // JSON alanları (nvarchar(max))
        builder.Property(x => x.Title).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();
        builder.Property(x => x.LongDescription).HasJsonConversion();
        builder.Property(x => x.Location).HasJsonConversion();
        builder.Property(x => x.Image).HasJsonConversion();
        builder.Property(x => x.Gallery).HasJsonConversion();
        builder.Property(x => x.BreakfastNote).HasJsonConversion();
        builder.Property(x => x.BreakfastCard).HasJsonConversion();
        builder.Property(x => x.Capacity).HasJsonConversion();
        builder.Property(x => x.Amenities).HasJsonConversion();
        builder.Property(x => x.FeatureStrip).HasJsonConversion();
        builder.Property(x => x.DetailedAmenities).HasJsonConversion();
        builder.Property(x => x.Distances).HasJsonConversion();
        builder.Property(x => x.LocationNote).HasJsonConversion();
        builder.Property(x => x.Rules).HasJsonConversion();
        builder.Property(x => x.RatingLabel).HasJsonConversion();
        builder.Property(x => x.SeoTitle).HasJsonConversion();
        builder.Property(x => x.SeoDescription).HasJsonConversion();
        builder.Property(x => x.SeoKeywords).HasJsonConversion();
        builder.Property(x => x.OgImage).HasJsonConversion();

        builder.Property(x => x.RatingScore).HasPrecision(4, 2);
        builder.Property(x => x.DefaultPricePerNight).HasPrecision(18, 2);
        builder.Property(x => x.ExtraAdultPricePerNight).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasConversion<string>().HasMaxLength(3);

        // Bölge silinirse bungalov bozulmaz, RegionId null olur
        builder.HasOne(x => x.Region)
            .WithMany()
            .HasForeignKey(x => x.RegionId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Slug).IsUnique().HasFilter("[DeletedAt] IS NULL");
        builder.HasIndex(x => new { x.IsActive, x.IsFeatured });
    }
}