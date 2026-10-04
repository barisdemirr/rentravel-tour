using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.VehicleSegments;

public static class UpdateVehicleSegment
{
    public record Command(string Key, LocalizedText Label, string Icon, int OrderIndex, bool IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<VehicleSegmentDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var segment = await db.VehicleSegments.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (segment is null)
                return Result<VehicleSegmentDto>.Fail(Error.NotFound("Segment bulunamadı."));

            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("icon", cmd.Icon).MaxLength("icon", cmd.Icon, 100)
                .Required("label.tr", cmd.Label?.Tr);

            if (!validator.IsValid) return validator.ToFailure<VehicleSegmentDto>();

            if (await db.VehicleSegments.AnyAsync(x => x.Key == key && x.Id != id, ct))
                return Result<VehicleSegmentDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            segment.Key = key;
            segment.Label = cmd.Label!;
            segment.Icon = cmd.Icon.Trim();
            segment.OrderIndex = cmd.OrderIndex;
            segment.IsActive = cmd.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<VehicleSegmentDto>.Success(VehicleSegmentDto.From(segment));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/vehicle-segments/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}