using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.AgePriceRules;

// Oluştururken ve güncellerken değişen alanlar
public record AgeRuleInput
{
    public int MinAge { get; init; }
    public int MaxAge { get; init; }
    public AgePriceType? Type { get; init; }
    public decimal? Price { get; init; }
    public decimal? Percentage { get; init; }
    public LocalizedText? Label { get; init; }
    public bool? IsActive { get; init; }
}

public class AgePriceRuleSaveHandler(AppDbContext db, PriceOwnerChecker owners)
{
    // existing null ise yeni kayıt: ownerType/ownerId kullanılır. Güncellemede sahip değişmez.
    public async Task<Result<AgePriceRuleDto>> Save(
        PriceOwnerType? ownerType, Guid ownerId, AgePriceRule? existing, AgeRuleInput input, CancellationToken ct)
    {
        var validator = new Validator()
            .Must("minAge", input.MinAge >= 0, "minAge negatif olamaz.")
            .Must("maxAge", input.MaxAge >= input.MinAge, "maxAge, minAge'den küçük olamaz.")
            .Must("maxAge", input.MaxAge <= 120, "maxAge en fazla 120 olabilir.")
            .Must("type", input.Type is { } ty && Enum.IsDefined(ty), "type zorunlu ve geçerli olmalı (Fixed, Percentage, Free).")
            .LocalizedRequired("label", input.Label, 100);

        if (input.Type == AgePriceType.Fixed)
            validator.Must("price", input.Price is >= 0, "Fixed için price zorunlu ve negatif olamaz.");

        if (input.Type == AgePriceType.Percentage)
            validator.Must("percentage", input.Percentage is >= 0 and <= 100,
                "Percentage için percentage zorunlu ve 0 ile 100 arasında olmalı.");

        if (existing is null)
        {
            // Yaş fiyatı sadece tur ve bungalov için geçerli
            validator.Must("ownerType",
                ownerType is PriceOwnerType.DailyTour or PriceOwnerType.CultureTour or PriceOwnerType.Bungalow,
                "ownerType zorunlu ve DailyTour, CultureTour veya Bungalow olmalı.");

            if (ownerType is PriceOwnerType.DailyTour or PriceOwnerType.CultureTour or PriceOwnerType.Bungalow
                && !await owners.ExistsAsync(ownerType.Value, ownerId, ct))
                validator.AddError("ownerId", "Sahip bulunamadı.");
        }

        if (!validator.IsValid) return validator.ToFailure<AgePriceRuleDto>();

        var effectiveType = existing?.OwnerType ?? ownerType!.Value;
        var effectiveOwnerId = existing?.OwnerId ?? ownerId;
        var isActive = input.IsActive ?? existing?.IsActive ?? true;

        // Aynı sahibin aktif kuralları çakışamaz
        if (isActive)
        {
            var selfId = existing?.Id ?? Guid.Empty;

            var clash = await db.AgePriceRules.AsNoTracking().FirstOrDefaultAsync(x =>
                x.OwnerType == effectiveType && x.OwnerId == effectiveOwnerId && x.IsActive
                && x.Id != selfId && x.MinAge <= input.MaxAge && x.MaxAge >= input.MinAge, ct);

            if (clash is not null)
                return Result<AgePriceRuleDto>.Fail(Error.Conflict(
                    $"Yaş aralığı '{clash.Label.Tr}' kuralıyla çakışıyor ({clash.MinAge}-{clash.MaxAge})."));
        }

        var rule = existing ?? new AgePriceRule { OwnerType = effectiveType, OwnerId = effectiveOwnerId };

        rule.MinAge = input.MinAge;
        rule.MaxAge = input.MaxAge;
        rule.Type = input.Type!.Value;
        // Tipe uymayan alan temizlenir
        rule.Price = input.Type == AgePriceType.Fixed ? input.Price : null;
        rule.Percentage = input.Type == AgePriceType.Percentage ? input.Percentage : null;
        rule.Label = input.Label!;
        rule.IsActive = isActive;

        if (existing is null) db.AgePriceRules.Add(rule);
        await db.SaveChangesAsync(ct);

        return Result<AgePriceRuleDto>.Success(AgePriceRuleDto.From(rule));
    }
}