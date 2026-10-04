using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AgePriceRules;

public static class GetAgePriceRules
{
    public class Handler(AppDbContext db)
    {
        // Bir sahibin tüm yaş kuralları (pasifler dahil), yaşa göre sıralı
        public async Task<List<AgePriceRuleDto>> Handle(PriceOwnerType ownerType, Guid ownerId, CancellationToken ct)
        {
            var rules = await db.AgePriceRules.AsNoTracking()
                .Where(x => x.OwnerType == ownerType && x.OwnerId == ownerId)
                .OrderBy(x => x.MinAge)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return rules.Select(AgePriceRuleDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/age-price-rules",
                async (string? ownerType, Guid? ownerId, Handler handler, CancellationToken ct) =>
                {
                    var errors = new Dictionary<string, string[]>();

                    if (!QueryParsing.TryParseEnum<PriceOwnerType>(ownerType, out var type))
                        errors["ownerType"] = ["ownerType zorunlu ve geçerli olmalı (DailyTour, CultureTour, Bungalow)."];

                    if (ownerId is null || ownerId == Guid.Empty)
                        errors["ownerId"] = ["ownerId zorunludur."];

                    if (errors.Count > 0) return Results.ValidationProblem(errors);

                    return Results.Ok(await handler.Handle(type, ownerId!.Value, ct));
                });
    }
}