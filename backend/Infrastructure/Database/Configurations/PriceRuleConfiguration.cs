using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class PriceRuleConfiguration : IEntityTypeConfiguration<PriceRule>
{
    public void Configure(EntityTypeBuilder<PriceRule> builder)
    {
        builder.ToTable("PriceRules");

        builder.Property(x => x.OwnerType).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.Label).HasJsonConversion();

        // Fiyat hesaplarında sahibine göre aranır
        builder.HasIndex(x => new { x.OwnerType, x.OwnerId });
    }
}