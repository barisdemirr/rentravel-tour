using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class BungalowRegionConfiguration : IEntityTypeConfiguration<BungalowRegion>
{
    public void Configure(EntityTypeBuilder<BungalowRegion> builder)
    {
        builder.ToTable("BungalowRegions");

        builder.Property(x => x.Key).HasMaxLength(50).IsRequired();
        builder.Property(x => x.ShortLabel).HasJsonConversion();
        builder.Property(x => x.FullLabel).HasJsonConversion();
        builder.Property(x => x.Thumbnail).HasJsonConversion();

        builder.HasIndex(x => x.Key).IsUnique().HasFilter("[DeletedAt] IS NULL");
    }
}