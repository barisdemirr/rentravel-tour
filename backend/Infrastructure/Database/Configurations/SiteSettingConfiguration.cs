using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class SiteSettingConfiguration : IEntityTypeConfiguration<SiteSetting>
{
    public void Configure(EntityTypeBuilder<SiteSetting> builder)
    {
        builder.ToTable("SiteSettings");

        builder.Property(x => x.GoogleAnalyticsId).HasMaxLength(50);
        builder.Property(x => x.SearchConsoleToken).HasMaxLength(100);
        builder.Property(x => x.FacebookPixelId).HasMaxLength(50);
        builder.Property(x => x.YandexMetrikaId).HasMaxLength(50);
        builder.Property(x => x.RobotsTxtContent).HasMaxLength(5000);
    }
}