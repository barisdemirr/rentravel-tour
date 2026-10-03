using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourCategories;

public static class UpdateTourCategory
{
    public record Command(
        string Key, LocalizedText Label, string Icon,
        TourCategoryScope? AppliesTo, int OrderIndex, bool IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<TourCategoryDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var category = await db.TourCategories.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (category is null)
                return Result<TourCategoryDto>.Fail(Error.NotFound("Kategori bulunamadı."));

            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("icon", cmd.Icon).MaxLength("icon", cmd.Icon, 100)
                .Required("label.tr", cmd.Label?.Tr)
                .Must("appliesTo", cmd.AppliesTo is { } scope && Enum.IsDefined(scope),
                        "appliesTo zorunlu ve geçerli olmalı (Daily, Culture, Both).");

            if (!validator.IsValid) return validator.ToFailure<TourCategoryDto>();

            if (await db.TourCategories.AnyAsync(x => x.Key == key && x.Id != id, ct))
                return Result<TourCategoryDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            category.Key = key;
            category.Label = cmd.Label!;
            category.Icon = cmd.Icon.Trim();
            category.AppliesTo = cmd.AppliesTo!.Value;
            category.OrderIndex = cmd.OrderIndex;
            category.IsActive = cmd.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<TourCategoryDto>.Success(TourCategoryDto.From(category));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/tour-categories/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}