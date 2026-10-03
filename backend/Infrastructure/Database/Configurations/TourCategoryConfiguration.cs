using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class TourCategoryConfiguration : IEntityTypeConfiguration<TourCategory>
{
    public void Configure(EntityTypeBuilder<TourCategory> builder)
    {
        builder.ToTable("TourCategories");

        builder.Property(x => x.Key).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Icon).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Label).HasJsonConversion();
        builder.Property(x => x.AppliesTo).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(x => x.Key).IsUnique().HasFilter("[DeletedAt] IS NULL");
    }
}