using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Features.Tours;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public class CultureTourSaveHandler(AppDbContext db, TourFieldsHandler fields)
{
    public async Task<Result<CultureTourDto>> Save(CultureTour? existing, CultureTourInput input, CancellationToken ct)
    {
        var validator = new Validator()
            .Must("nights", input.Nights is >= 0 and <= 30, "nights 0 ile 30 arasında olmalı.");

        if (input.IsActive)
            validator.Must("nights", input.Nights >= 1, "Yayınlamak için en az 1 gece gerekli.");

        var tour = existing ?? new CultureTour();

        await fields.ApplyAsync(tour, input, TourCategoryScope.Culture, validator, ct);

        var plan = SlugResolver.Plan(input.Slug, existing?.Slug, input.Title?.Tr, validator);

        if (!validator.IsValid) return validator.ToFailure<CultureTourDto>();

        var currentId = existing?.Id ?? Guid.Empty;
        var (slug, conflict) = await SlugResolver.EnsureUniqueAsync(
            plan, existing is null,
            s => db.CultureTours.AnyAsync(x => x.Slug == s && x.Id != currentId, ct));

        if (conflict is not null) return Result<CultureTourDto>.Fail(conflict);

        tour.Slug = slug;
        tour.Nights = input.Nights;

        if (existing is null) db.CultureTours.Add(tour);
        await db.SaveChangesAsync(ct);

        var saved = await db.CultureTours.AsNoTracking()
            .Include(x => x.Category)
            .FirstAsync(x => x.Id == tour.Id, ct);

        return Result<CultureTourDto>.Success(CultureTourDto.From(saved));
    }
}