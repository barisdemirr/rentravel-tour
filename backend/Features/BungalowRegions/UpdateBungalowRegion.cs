using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.BungalowRegions;

public static class UpdateBungalowRegion
{
    public record Command(
        string Key, LocalizedText ShortLabel, LocalizedText FullLabel,
        MediaItem? Thumbnail, int OrderIndex, bool IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<BungalowRegionDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var region = await db.BungalowRegions.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (region is null)
                return Result<BungalowRegionDto>.Fail(Error.NotFound("Bölge bulunamadı."));

            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("shortLabel.tr", cmd.ShortLabel?.Tr)
                .Required("fullLabel.tr", cmd.FullLabel?.Tr);

            if (!validator.IsValid) return validator.ToFailure<BungalowRegionDto>();

            if (await db.BungalowRegions.AnyAsync(x => x.Key == key && x.Id != id, ct))
                return Result<BungalowRegionDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            region.Key = key;
            region.ShortLabel = cmd.ShortLabel!;
            region.FullLabel = cmd.FullLabel!;
            region.Thumbnail = cmd.Thumbnail;
            region.OrderIndex = cmd.OrderIndex;
            region.IsActive = cmd.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<BungalowRegionDto>.Success(BungalowRegionDto.From(region));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/bungalow-regions/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}