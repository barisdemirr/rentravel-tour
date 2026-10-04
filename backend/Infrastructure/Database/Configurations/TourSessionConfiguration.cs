using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class TourSessionConfiguration : IEntityTypeConfiguration<TourSession>
{
    public void Configure(EntityTypeBuilder<TourSession> builder)
    {
        builder.ToTable("TourSessions");

        builder.Property(x => x.TourType).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.PriceOverride).HasPrecision(18, 2);

        // Bir turun aynı tarihe tek seansı olur (silinmiş kayıtlar sayılmaz)
        builder.HasIndex(x => new { x.TourType, x.TourId, x.Date })
            .IsUnique()
            .HasFilter("[DeletedAt] IS NULL");
    }
}