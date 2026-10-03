using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleSegments;

public static class CreateVehicleSegment
{
    public record Command(string Key, LocalizedText Label, string Icon, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<VehicleSegmentDto>> Handle(Command cmd, CancellationToken ct)
        {
            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("icon", cmd.Icon).MaxLength("icon", cmd.Icon, 100)
                .Required("label.tr", cmd.Label?.Tr);

            if (!validator.IsValid) return validator.ToFailure<VehicleSegmentDto>();

            if (await db.VehicleSegments.AnyAsync(x => x.Key == key, ct))
                return Result<VehicleSegmentDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            var segment = new VehicleSegment
            {
                Key = key,
                Label = cmd.Label!,
                Icon = cmd.Icon.Trim(),
                OrderIndex = cmd.OrderIndex
            };

            db.VehicleSegments.Add(segment);
            await db.SaveChangesAsync(ct);

            return Result<VehicleSegmentDto>.Success(VehicleSegmentDto.From(segment));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/vehicle-segments",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}