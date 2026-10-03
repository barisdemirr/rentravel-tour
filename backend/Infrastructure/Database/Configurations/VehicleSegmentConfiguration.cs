using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class VehicleSegmentConfiguration : IEntityTypeConfiguration<VehicleSegment>
{
    public void Configure(EntityTypeBuilder<VehicleSegment> builder)
    {
        builder.ToTable("VehicleSegments");

        builder.Property(x => x.Key).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Icon).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Label).HasJsonConversion();

        // Soft delete'li kayıt aynı Key'in yeniden kullanılmasını engellemesin
        builder.HasIndex(x => x.Key)
            .IsUnique()
            .HasFilter("[DeletedAt] IS NULL");
    }
}