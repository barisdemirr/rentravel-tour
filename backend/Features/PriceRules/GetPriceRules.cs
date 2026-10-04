using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.PriceRules;

public static class GetPriceRules
{
    public class Handler(AppDbContext db)
    {
        // Bir sahibin tüm kuralları (pasifler dahil): başlangıç tarihine, sonra önceliğe göre
        public async Task<List<PriceRuleDto>> Handle(PriceOwnerType ownerType, Guid ownerId, CancellationToken ct)
        {
            var rules = await db.PriceRules.AsNoTracking()
                .Where(x => x.OwnerType == ownerType && x.OwnerId == ownerId)
                .OrderBy(x => x.StartDate)
                .ThenByDescending(x => x.Priority)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return rules.Select(PriceRuleDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/price-rules",
                async (string? ownerType, Guid? ownerId, Handler handler, CancellationToken ct) =>
                {
                    var errors = new Dictionary<string, string[]>();

                    if (!QueryParsing.TryParseEnum<PriceOwnerType>(ownerType, out var type))
                        errors["ownerType"] = ["ownerType zorunlu ve geçerli olmalı (Vehicle, DailyTour, CultureTour, Bungalow)."];

                    if (ownerId is null || ownerId == Guid.Empty)
                        errors["ownerId"] = ["ownerId zorunludur."];

                    if (errors.Count > 0) return Results.ValidationProblem(errors);

                    return Results.Ok(await handler.Handle(type, ownerId!.Value, ct));
                });
    }
}