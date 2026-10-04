using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.PriceRules;

public static class UpdatePriceRule
{
    public class Handler(AppDbContext db, PriceRuleSaveHandler saver)
    {
        public async Task<Result<PriceRuleDto>> Handle(Guid id, PriceRuleInput input, CancellationToken ct)
        {
            var rule = await db.PriceRules.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (rule is null)
                return Result<PriceRuleDto>.Fail(Error.NotFound("Fiyat kuralı bulunamadı."));

            return await saver.Save(null, Guid.Empty, rule, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/price-rules/{id:guid}",
                async (Guid id, PriceRuleInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}