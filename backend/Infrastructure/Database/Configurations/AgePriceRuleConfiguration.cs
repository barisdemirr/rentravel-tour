using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class AgePriceRuleConfiguration : IEntityTypeConfiguration<AgePriceRule>
{
    public void Configure(EntityTypeBuilder<AgePriceRule> builder)
    {
        builder.ToTable("AgePriceRules");

        builder.Property(x => x.OwnerType).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Type).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.Percentage).HasPrecision(5, 2);
        builder.Property(x => x.Label).HasJsonConversion();

        builder.HasIndex(x => new { x.OwnerType, x.OwnerId });
    }
}