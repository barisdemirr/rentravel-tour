using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.PriceRules;

// Oluştururken ve güncellerken değişen alanlar
public record PriceRuleInput
{
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public decimal Price { get; init; }
    public int Priority { get; init; }
    public LocalizedText? Label { get; init; }
    public bool? IsActive { get; init; }
}

public class PriceRuleSaveHandler(AppDbContext db, PriceOwnerChecker owners)
{
    // existing null ise yeni kayıt: ownerType/ownerId kullanılır. Güncellemede sahip değişmez.
    public async Task<Result<PriceRuleDto>> Save(
        PriceOwnerType? ownerType, Guid ownerId, PriceRule? existing, PriceRuleInput input, CancellationToken ct)
    {
        var validator = new Validator()
            .Must("startDate", input.StartDate is not null, "startDate zorunludur.")
            .Must("endDate", input.EndDate is not null, "endDate zorunludur.")
            .Must("endDate",
                  input.StartDate is null || input.EndDate is null || input.EndDate >= input.StartDate,
                  "endDate, startDate'ten önce olamaz.")
            .Must("price", input.Price > 0, "price 0'dan büyük olmalı.")
            .LocalizedOptional("label", input.Label, 60);

        if (existing is null)
        {
            validator.Must("ownerType", ownerType is { } t && Enum.IsDefined(t),
                "ownerType zorunlu ve geçerli olmalı (Vehicle, DailyTour, CultureTour, Bungalow).");

            validator.Must("ownerType", ownerType != PriceOwnerType.CultureTour,
                "Kültür turlarında fiyat konaklama tipine göre belirlenir, tarihe göre fiyat kuralı tanımlanamaz.");

            if (ownerType is { } ot && Enum.IsDefined(ot) && !await owners.ExistsAsync(ot, ownerId, ct))
                validator.AddError("ownerId", "Sahip bulunamadı.");
        }

        if (!validator.IsValid) return validator.ToFailure<PriceRuleDto>();

        var rule = existing ?? new PriceRule { OwnerType = ownerType!.Value, OwnerId = ownerId };

        rule.StartDate = input.StartDate!.Value;
        rule.EndDate = input.EndDate!.Value;
        rule.Price = input.Price;
        rule.Priority = input.Priority;
        rule.Label = input.Label.OrNull();
        rule.IsActive = input.IsActive ?? existing?.IsActive ?? true;

        if (existing is null) db.PriceRules.Add(rule);
        await db.SaveChangesAsync(ct);

        return Result<PriceRuleDto>.Success(PriceRuleDto.From(rule));
    }
}