using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.BungalowRegions;

public static class CreateBungalowRegion
{
    public record Command(string Key, LocalizedText ShortLabel, LocalizedText FullLabel, MediaItem? Thumbnail, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<BungalowRegionDto>> Handle(Command cmd, CancellationToken ct)
        {
            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("shortLabel.tr", cmd.ShortLabel?.Tr)
                .Required("fullLabel.tr", cmd.FullLabel?.Tr);

            if (!validator.IsValid) return validator.ToFailure<BungalowRegionDto>();

            if (await db.BungalowRegions.AnyAsync(x => x.Key == key, ct))
                return Result<BungalowRegionDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            var region = new BungalowRegion
            {
                Key = key,
                ShortLabel = cmd.ShortLabel!,
                FullLabel = cmd.FullLabel!,
                Thumbnail = cmd.Thumbnail,
                OrderIndex = cmd.OrderIndex
            };

            db.BungalowRegions.Add(region);
            await db.SaveChangesAsync(ct);

            return Result<BungalowRegionDto>.Success(BungalowRegionDto.From(region));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/bungalow-regions",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}