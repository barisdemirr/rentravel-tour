using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.BungalowExtras;

public static class CreateBungalowExtra
{
    public record Command(
        string Key, string Icon, LocalizedText Title, LocalizedText Description,
        LocalizedText? Tooltip, ExtraChargeMode? ChargeMode, decimal Price,
        Currency? Currency, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<BungalowExtraDto>> Handle(Command cmd, CancellationToken ct)
        {
            var key = (cmd.Key ?? "").Trim();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("icon", cmd.Icon).MaxLength("icon", cmd.Icon, 100)
                .Required("title.tr", cmd.Title?.Tr)
                .Required("description.tr", cmd.Description?.Tr)
                .Must("tooltip.tr", cmd.Tooltip is null || !string.IsNullOrWhiteSpace(cmd.Tooltip.Tr),
                      "tooltip verildiyse tooltip.tr zorunludur.")
                .Must("chargeMode", cmd.ChargeMode is { } m && Enum.IsDefined(m),
                      "chargeMode zorunlu ve geçerli olmalı (Once, Daily).")
                .Must("price", cmd.Price >= 0, "price negatif olamaz.")
                .Must("currency", cmd.Currency is { } c && Enum.IsDefined(c),
                      "currency zorunlu ve geçerli olmalı (TRY, USD, EUR).");

            if (!validator.IsValid) return validator.ToFailure<BungalowExtraDto>();

            if (await db.BungalowExtras.AnyAsync(x => x.Key == key, ct))
                return Result<BungalowExtraDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            var extra = new BungalowExtra
            {
                Key = key,
                Icon = cmd.Icon.Trim(),
                Title = cmd.Title!,
                Description = cmd.Description!,
                Tooltip = cmd.Tooltip,
                ChargeMode = cmd.ChargeMode!.Value,
                Price = cmd.Price,
                Currency = cmd.Currency!.Value,
                OrderIndex = cmd.OrderIndex
            };

            db.BungalowExtras.Add(extra);
            await db.SaveChangesAsync(ct);

            return Result<BungalowExtraDto>.Success(BungalowExtraDto.From(extra));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/bungalow-extras",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}