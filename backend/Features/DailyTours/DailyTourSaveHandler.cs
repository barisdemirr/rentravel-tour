using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public class DailyTourSaveHandler(AppDbContext db, TourFieldsHandler fields)
{
    public async Task<Result<TourDto>> Save(DailyTour? existing, TourInput input, CancellationToken ct)
    {
        var validator = new Validator();
        var tour = existing ?? new DailyTour();

        await fields.ApplyAsync(tour, input, TourCategoryScope.Daily, validator, ct);

        var plan = SlugResolver.Plan(input.Slug, existing?.Slug, input.Title?.Tr, validator);

        if (!validator.IsValid) return validator.ToFailure<TourDto>();

        var currentId = existing?.Id ?? Guid.Empty;
        var (slug, conflict) = await SlugResolver.EnsureUniqueAsync(
            plan, existing is null,
            s => db.DailyTours.AnyAsync(x => x.Slug == s && x.Id != currentId, ct));

        if (conflict is not null) return Result<TourDto>.Fail(conflict);

        tour.Slug = slug;

        if (existing is null) db.DailyTours.Add(tour);
        await db.SaveChangesAsync(ct);

        // Kategori bilgisiyle birlikte yeniden oku (silinmiş kategori null görünür)
        var saved = await db.DailyTours.AsNoTracking()
            .Include(x => x.Category)
            .FirstAsync(x => x.Id == tour.Id, ct);

        return Result<TourDto>.Success(TourDto.From(saved));
    }
}