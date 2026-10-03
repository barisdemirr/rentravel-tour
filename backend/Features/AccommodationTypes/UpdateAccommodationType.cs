using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationTypes;

public static class UpdateAccommodationType
{
    public record Command(
        string Key, LocalizedText Label, LocalizedText? Description,
        string? Icon, int OrderIndex, bool IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<AccommodationTypeDto>> Handle(Guid id, Command cmd, CancellationToken ct)
        {
            var type = await db.AccommodationTypes.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (type is null)
                return Result<AccommodationTypeDto>.Fail(Error.NotFound("Konaklama tipi bulunamadı."));

            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("label.tr", cmd.Label?.Tr)
                .Must("description.tr", cmd.Description is null || !string.IsNullOrWhiteSpace(cmd.Description.Tr),
                      "description verildiyse description.tr zorunludur.")
                .MaxLength("icon", cmd.Icon, 100);

            if (!validator.IsValid) return validator.ToFailure<AccommodationTypeDto>();

            if (await db.AccommodationTypes.AnyAsync(x => x.Key == key && x.Id != id, ct))
                return Result<AccommodationTypeDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            type.Key = key;
            type.Label = cmd.Label!;
            type.Description = cmd.Description;
            type.Icon = string.IsNullOrWhiteSpace(cmd.Icon) ? null : cmd.Icon.Trim();
            type.OrderIndex = cmd.OrderIndex;
            type.IsActive = cmd.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<AccommodationTypeDto>.Success(AccommodationTypeDto.From(type));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/accommodation-types/{id:guid}",
                async (Guid id, Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}