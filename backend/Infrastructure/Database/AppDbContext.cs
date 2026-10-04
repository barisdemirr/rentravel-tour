using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;

namespace Rentravel.Infrastructure.Database;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{

    public DbSet<VehicleSegment> VehicleSegments => Set<VehicleSegment>();
    public DbSet<BungalowRegion> BungalowRegions => Set<BungalowRegion>();
    public DbSet<TourCategory> TourCategories => Set<TourCategory>();
    public DbSet<VehicleExtra> VehicleExtras => Set<VehicleExtra>();
    public DbSet<AccommodationType> AccommodationTypes => Set<AccommodationType>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<DailyTour> DailyTours => Set<DailyTour>();
    public DbSet<CultureTour> CultureTours => Set<CultureTour>();
    public DbSet<Bungalow> Bungalows => Set<Bungalow>();
    public DbSet<PriceRule> PriceRules => Set<PriceRule>();
    public DbSet<AgePriceRule> AgePriceRules => Set<AgePriceRule>();
    public DbSet<CultureTourAccommodationPrice> CultureTourAccommodationPrices => Set<CultureTourAccommodationPrice>();
    public DbSet<TourSession> TourSessions => Set<TourSession>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Soft delete: DeletedAt dolu olan kayıtlar tüm sorgulardan otomatik elenir
        foreach (var entityType in modelBuilder.Model.GetEntityTypes()
                     .Where(t => typeof(BaseEntity).IsAssignableFrom(t.ClrType)))
        {
            var param = Expression.Parameter(entityType.ClrType, "e");
            var deletedAt = Expression.Property(param, nameof(BaseEntity.DeletedAt));
            var body = Expression.Equal(deletedAt, Expression.Constant(null, typeof(DateTime?)));
            entityType.SetQueryFilter(Expression.Lambda(body, param));
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    break;

                case EntityState.Deleted:
                    // Hard delete yok: silme isteğini soft delete'e çevir
                    entry.State = EntityState.Modified;
                    entry.Entity.DeletedAt = now;
                    entry.Entity.IsActive = false;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}