using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class BungalowExtraConfiguration : IEntityTypeConfiguration<BungalowExtra>
{
    public void Configure(EntityTypeBuilder<BungalowExtra> builder)
    {
        builder.ToTable("BungalowExtras");

        builder.Property(x => x.Key)
            .HasMaxLength(50)
            .IsRequired()
            .UseCollation("SQL_Latin1_General_CP1_CI_AS");

        builder.Property(x => x.Icon).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Title).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();
        builder.Property(x => x.Tooltip).HasJsonConversion();

        builder.Property(x => x.ChargeMode).HasConversion<string>().HasMaxLength(20);
        builder.Property(x => x.Price).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasConversion<string>().HasMaxLength(3);

        builder.HasIndex(x => x.Key).IsUnique().HasFilter("[DeletedAt] IS NULL");
    }
}