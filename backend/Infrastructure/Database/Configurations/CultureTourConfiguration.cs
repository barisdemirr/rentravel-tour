using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database.Configurations;

public class CultureTourConfiguration : IEntityTypeConfiguration<CultureTour>
{
    public void Configure(EntityTypeBuilder<CultureTour> builder)
    {
        builder.ToTable("CultureTours");
        builder.ConfigureTourBase();
    }
}