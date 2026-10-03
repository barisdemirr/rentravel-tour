using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class VehicleExtraConfiguration : IEntityTypeConfiguration<VehicleExtra>
{
    public void Configure(EntityTypeBuilder<VehicleExtra> builder)
    {
        builder.ToTable("VehicleExtras");

        builder.Property(x => x.Key).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Icon).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Title).HasJsonConversion();
        builder.Property(x => x.Description).HasJsonConversion();
        builder.Property(x => x.Tooltip).HasJsonConversion();
        builder.Property(x => x.DailyPrice).HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasConversion<string>().HasMaxLength(3);

        builder.HasIndex(x => x.Key).IsUnique().HasFilter("[DeletedAt] IS NULL");
    }
}