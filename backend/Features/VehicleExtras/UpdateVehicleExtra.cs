using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleExtras;

public static class UpdateVehicleExtra
{
    public record Command(
        string Key, string Icon, LocalizedText Title, LocalizedText Description,
        LocalizedText? Tooltip, decimal DailyPrice, Currency? Currency, int OrderIndex, bool IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<VehicleExtraDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var extra = await db.VehicleExtras.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (extra is null)
                return Result<VehicleExtraDto>.Fail(Error.NotFound("Ekstra bulunamadı."));

            var key = (cmd.Key ?? "").Trim();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("icon", cmd.Icon).MaxLength("icon", cmd.Icon, 100)
                .Required("title.tr", cmd.Title?.Tr)
                .Required("description.tr", cmd.Description?.Tr)
                .Must("tooltip.tr", cmd.Tooltip is null || !string.IsNullOrWhiteSpace(cmd.Tooltip.Tr),
                      "tooltip verildiyse tooltip.tr zorunludur.")
                .Must("dailyPrice", cmd.DailyPrice >= 0, "dailyPrice negatif olamaz.")
                .Must("currency", cmd.Currency is { } c && Enum.IsDefined(c),
                      "currency zorunlu ve geçerli olmalı (TRY, USD, EUR).");

            if (!validator.IsValid) return validator.ToFailure<VehicleExtraDto>();

            if (await db.VehicleExtras.AnyAsync(x => x.Key == key && x.Id != id, ct))
                return Result<VehicleExtraDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            extra.Key = key;
            extra.Icon = cmd.Icon.Trim();
            extra.Title = cmd.Title!;
            extra.Description = cmd.Description!;
            extra.Tooltip = cmd.Tooltip;
            extra.DailyPrice = cmd.DailyPrice;
            extra.Currency = cmd.Currency!.Value;
            extra.OrderIndex = cmd.OrderIndex;
            extra.IsActive = cmd.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<VehicleExtraDto>.Success(VehicleExtraDto.From(extra));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/vehicle-extras/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}