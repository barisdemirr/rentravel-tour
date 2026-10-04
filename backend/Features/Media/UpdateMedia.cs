using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Media;

public static class UpdateMedia
{
    public record Command(MediaCategory? Category, LocalizedText? AltText);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<MediaAssetDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var asset = await db.MediaAssets.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (asset is null)
                return Result<MediaAssetDto>.Fail(Error.NotFound("Görsel bulunamadı."));

            var validator = new Validator()
                .Must("category", cmd.Category is { } c && Enum.IsDefined(c),
                      "category zorunlu ve geçerli olmalı (General, DailyTour, CultureTour, Vehicle, Bungalow).")
                .Must("altText.tr", cmd.AltText is null || !string.IsNullOrWhiteSpace(cmd.AltText.Tr),
                      "altText verildiyse altText.tr zorunludur.");

            if (!validator.IsValid) return validator.ToFailure<MediaAssetDto>();

            asset.Category = cmd.Category!.Value;
            asset.AltText = cmd.AltText;

            await db.SaveChangesAsync(ct);

            return Result<MediaAssetDto>.Success(MediaAssetDto.From(asset));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/media/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}