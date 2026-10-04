using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.TourSessions;

// Oluştururken ve güncellerken değişen alanlar
public record SessionInput
{
    public DateOnly? Date { get; init; }
    public int Seats { get; init; }
    public decimal? PriceOverride { get; init; }
    public bool? IsActive { get; init; }
}

public class TourSessionSaveHandler(AppDbContext db, PriceOwnerChecker owners)
{
    // existing null ise yeni kayıt: tourType/tourId kullanılır. Güncellemede tur değişmez.
    public async Task<Result<TourSessionDto>> Save(
        TourType? tourType, Guid tourId, TourSession? existing, SessionInput input, CancellationToken ct)
    {
        var validator = new Validator()
            .Must("date", input.Date is not null, "date zorunludur.")
            .Must("seats", input.Seats >= 0, "seats negatif olamaz.")
            .Must("priceOverride", input.PriceOverride is null or > 0, "priceOverride boş veya 0'dan büyük olmalı.");

        if (existing is null)
        {
            validator.Must("tourType", tourType is { } t && Enum.IsDefined(t),
                "tourType zorunlu ve geçerli olmalı (Daily, Culture).");

            if (tourType is { } tt && Enum.IsDefined(tt))
            {
                var ownerType = tt == TourType.Daily ? PriceOwnerType.DailyTour : PriceOwnerType.CultureTour;

                if (!await owners.ExistsAsync(ownerType, tourId, ct))
                    validator.AddError("tourId", "Tur bulunamadı.");
            }
        }

        if (!validator.IsValid) return validator.ToFailure<TourSessionDto>();

        var effectiveType = existing?.TourType ?? tourType!.Value;
        var effectiveTourId = existing?.TourId ?? tourId;
        var selfId = existing?.Id ?? Guid.Empty;
        var date = input.Date!.Value;

        // Bir turun aynı tarihe tek seansı olur
        if (await db.TourSessions.AnyAsync(x =>
                x.TourType == effectiveType && x.TourId == effectiveTourId && x.Date == date && x.Id != selfId, ct))
            return Result<TourSessionDto>.Fail(Error.Conflict($"{date:yyyy-MM-dd} tarihli bir seans zaten var."));

        var session = existing ?? new TourSession { TourType = effectiveType, TourId = effectiveTourId };

        session.Date = date;
        session.Seats = input.Seats;
        session.PriceOverride = input.PriceOverride;
        session.IsActive = input.IsActive ?? existing?.IsActive ?? true;

        if (existing is null) db.TourSessions.Add(session);
        await db.SaveChangesAsync(ct);

        return Result<TourSessionDto>.Success(TourSessionDto.From(session));
    }
}