using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourCategories;

public static class CreateTourCategory
{
    public record Command(string Key, LocalizedText Label, string Icon, TourCategoryScope? AppliesTo, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<TourCategoryDto>> Handle(Command cmd, CancellationToken ct)
        {
            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("icon", cmd.Icon).MaxLength("icon", cmd.Icon, 100)
                .Required("label.tr", cmd.Label?.Tr)
                .Must("appliesTo", cmd.AppliesTo is { } scope && Enum.IsDefined(scope),
                   "appliesTo zorunlu ve geçerli olmalı (Daily, Culture, Both).");

            if (!validator.IsValid) return validator.ToFailure<TourCategoryDto>();

            if (await db.TourCategories.AnyAsync(x => x.Key == key, ct))
                return Result<TourCategoryDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            var category = new TourCategory
            {
                Key = key,
                Label = cmd.Label!,
                Icon = cmd.Icon.Trim(),
                AppliesTo = cmd.AppliesTo!.Value,
                OrderIndex = cmd.OrderIndex
            };

            db.TourCategories.Add(category);
            await db.SaveChangesAsync(ct);

            return Result<TourCategoryDto>.Success(TourCategoryDto.From(category));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/tour-categories",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}