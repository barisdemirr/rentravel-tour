using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class CultureTourAccommodationPriceConfiguration : IEntityTypeConfiguration<CultureTourAccommodationPrice>
{
    public void Configure(EntityTypeBuilder<CultureTourAccommodationPrice> builder)
    {
        builder.ToTable("CultureTourAccommodationPrices");

        builder.Property(x => x.PricePerPerson).HasPrecision(18, 2);

        builder.HasOne(x => x.CultureTour)
            .WithMany()
            .HasForeignKey(x => x.CultureTourId)
            .OnDelete(DeleteBehavior.Cascade);

        // Konaklama tipi katalogdan silinirken fiyatı olan tip sessizce kaybolmasın
        builder.HasOne(x => x.AccommodationType)
            .WithMany()
            .HasForeignKey(x => x.AccommodationTypeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Bir turda aynı konaklama tipi bir kez tanımlanır (silinmiş kayıtlar sayılmaz)
        builder.HasIndex(x => new { x.CultureTourId, x.AccommodationTypeId })
            .IsUnique()
            .HasFilter("[DeletedAt] IS NULL");
    }
}