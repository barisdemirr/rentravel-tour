using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class AccommodationTypeConfiguration : IEntityTypeConfiguration<AccommodationType>
{
    public void Configure(EntityTypeBuilder<AccommodationType> builder)
    {
        builder.ToTable("AccommodationTypes");

        builder.Property(x => x.Key).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Icon).HasMaxLength(100);
        builder.Property(x => x.Label).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();

        builder.HasIndex(x => x.Key).IsUnique().HasFilter("[DeletedAt] IS NULL");
    }
}