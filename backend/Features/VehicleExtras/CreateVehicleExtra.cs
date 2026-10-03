using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleExtras;

public static class CreateVehicleExtra
{
    public record Command(
        string Key, string Icon, LocalizedText Title, LocalizedText Description,
        LocalizedText? Tooltip, decimal DailyPrice, Currency? Currency, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<VehicleExtraDto>> Handle(Command cmd, CancellationToken ct)
        {
            var key = (cmd.Key ?? "").Trim(); // camelCase key'ler (youngDriver) bozulmasın

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

            if (await db.VehicleExtras.AnyAsync(x => x.Key == key, ct))
                return Result<VehicleExtraDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            var extra = new VehicleExtra
            {
                Key = key,
                Icon = cmd.Icon.Trim(),
                Title = cmd.Title!,
                Description = cmd.Description!,
                Tooltip = cmd.Tooltip,
                DailyPrice = cmd.DailyPrice,
                Currency = cmd.Currency!.Value,
                OrderIndex = cmd.OrderIndex
            };

            db.VehicleExtras.Add(extra);
            await db.SaveChangesAsync(ct);

            return Result<VehicleExtraDto>.Success(VehicleExtraDto.From(extra));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/vehicle-extras",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}