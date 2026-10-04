using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class VehicleConfiguration : IEntityTypeConfiguration<Vehicle>
{
    public void Configure(EntityTypeBuilder<Vehicle> builder)
    {
        builder.ToTable("Vehicles");

        builder.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        builder.Property(x => x.BadgeTone).HasMaxLength(20);
        builder.Property(x => x.Rating).HasMaxLength(20);

        // JSON alanları (nvarchar(max))
        builder.Property(x => x.Name).HasJsonConversion();
        builder.Property(x => x.Tagline).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();
        builder.Property(x => x.Image).HasJsonConversion();
        builder.Property(x => x.Gallery).HasJsonConversion();
        builder.Property(x => x.Badge).HasJsonConversion();
        builder.Property(x => x.Guarantee).HasJsonConversion();
        builder.Property(x => x.Specs).HasJsonConversion();
        builder.Property(x => x.DetailedSpecs).HasJsonConversion();
        builder.Property(x => x.Delivery).HasJsonConversion();
        builder.Property(x => x.Office).HasJsonConversion();
        builder.Property(x => x.DriverRequirements).HasJsonConversion();
        builder.Property(x => x.Extras).HasJsonConversion();
        builder.Property(x => x.SeoTitle).HasJsonConversion();
        builder.Property(x => x.SeoDescription).HasJsonConversion();
        builder.Property(x => x.SeoKeywords).HasJsonConversion();
        builder.Property(x => x.OgImage).HasJsonConversion();

        builder.Property(x => x.Deposit).HasPrecision(18, 2);
        builder.Property(x => x.ExtraKmPrice).HasPrecision(18, 2);
        builder.Property(x => x.DefaultDailyPrice).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasConversion<string>().HasMaxLength(3);

        // Segment silinirse araç bozulmaz, SegmentId null olur
        builder.HasOne(x => x.Segment)
            .WithMany()
            .HasForeignKey(x => x.SegmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Slug).IsUnique().HasFilter("[DeletedAt] IS NULL");
        builder.HasIndex(x => new { x.IsActive, x.IsFeatured }); // public liste ve ana sayfa sorguları
    }
}