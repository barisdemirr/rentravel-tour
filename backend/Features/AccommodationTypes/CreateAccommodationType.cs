using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AccommodationTypes;

public static class CreateAccommodationType
{
    public record Command(string Key, LocalizedText Label, LocalizedText? Description, string? Icon, int OrderIndex);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<AccommodationTypeDto>> Handle(Command cmd, CancellationToken ct)
        {
            var key = (cmd.Key ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("key", key).MaxLength("key", key, 50)
                .Required("label.tr", cmd.Label?.Tr)
                .Must("description.tr", cmd.Description is null || !string.IsNullOrWhiteSpace(cmd.Description.Tr),
                      "description verildiyse description.tr zorunludur.")
                .MaxLength("icon", cmd.Icon, 100);

            if (!validator.IsValid) return validator.ToFailure<AccommodationTypeDto>();

            if (await db.AccommodationTypes.AnyAsync(x => x.Key == key, ct))
                return Result<AccommodationTypeDto>.Fail(Error.Conflict($"'{key}' anahtarı zaten kullanılıyor."));

            var type = new AccommodationType
            {
                Key = key,
                Label = cmd.Label!,
                Description = cmd.Description,
                Icon = string.IsNullOrWhiteSpace(cmd.Icon) ? null : cmd.Icon.Trim(),
                OrderIndex = cmd.OrderIndex
            };

            db.AccommodationTypes.Add(type);
            await db.SaveChangesAsync(ct);

            return Result<AccommodationTypeDto>.Success(AccommodationTypeDto.From(type));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/accommodation-types",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}