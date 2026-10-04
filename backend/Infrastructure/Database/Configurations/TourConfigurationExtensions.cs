using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public static class TourConfigurationExtensions
{
    public static void ConfigureTourBase<T>(this EntityTypeBuilder<T> builder) where T : TourBase
    {
        builder.Property(x => x.Slug).HasMaxLength(100).IsRequired();
        builder.Property(x => x.BadgeTone).HasMaxLength(20);
        builder.Property(x => x.Duration).HasMaxLength(50);
        builder.Property(x => x.TransportIcon).HasMaxLength(100);

        // JSON alanları (nvarchar(max))
        builder.Property(x => x.Title).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();
        builder.Property(x => x.LongDescription).HasJsonConversion();
        builder.Property(x => x.Image).HasJsonConversion();
        builder.Property(x => x.Gallery).HasJsonConversion();
        builder.Property(x => x.Badge).HasJsonConversion();
        builder.Property(x => x.Transport).HasJsonConversion();
        builder.Property(x => x.Badges).HasJsonConversion();
        builder.Property(x => x.RoutePills).HasJsonConversion();
        builder.Property(x => x.QuickSpecs).HasJsonConversion();
        builder.Property(x => x.Editorial).HasJsonConversion();
        builder.Property(x => x.Itinerary).HasJsonConversion();
        builder.Property(x => x.Inclusions).HasJsonConversion();
        builder.Property(x => x.TravelNotes).HasJsonConversion();
        builder.Property(x => x.SeoTitle).HasJsonConversion();
        builder.Property(x => x.SeoDescription).HasJsonConversion();
        builder.Property(x => x.SeoKeywords).HasJsonConversion();
        builder.Property(x => x.OgImage).HasJsonConversion();

        builder.Property(x => x.DefaultBasePrice).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasConversion<string>().HasMaxLength(3);

        // Kategori silinirse tur bozulmaz, CategoryId null olur
        builder.HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Slug).IsUnique().HasFilter("[DeletedAt] IS NULL");
        builder.HasIndex(x => new { x.IsActive, x.IsFeatured });
    }
}