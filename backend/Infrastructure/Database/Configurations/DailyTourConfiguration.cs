using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class DailyTourConfiguration : IEntityTypeConfiguration<DailyTour>
{
    public void Configure(EntityTypeBuilder<DailyTour> builder)
    {
        builder.ToTable("DailyTours");
        builder.ConfigureTourBase();
    }
}