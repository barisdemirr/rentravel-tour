using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;

namespace Rentravel.Infrastructure.Services;

// Fiyat kuralı veya yaş fiyatının sahibi (araç, tur, bungalov) var mı? Polimorfik ilişkide FK olmadığı için burada kontrol edilir.
public class PriceOwnerChecker(AppDbContext db)
{
    public Task<bool> ExistsAsync(PriceOwnerType type, Guid id, CancellationToken ct) => type switch
    {
        PriceOwnerType.Vehicle => db.Vehicles.AnyAsync(x => x.Id == id, ct),
        PriceOwnerType.DailyTour => db.DailyTours.AnyAsync(x => x.Id == id, ct),
        PriceOwnerType.CultureTour => db.CultureTours.AnyAsync(x => x.Id == id, ct),
        PriceOwnerType.Bungalow => db.Bungalows.AnyAsync(x => x.Id == id, ct),
        _ => Task.FromResult(false)
    };
}