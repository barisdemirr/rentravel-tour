using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AgePriceRules;

public static class UpdateAgePriceRule
{
    public class Handler(AppDbContext db, AgePriceRuleSaveHandler saver)
    {
        public async Task<Result<AgePriceRuleDto>> Handle(Guid id, AgeRuleInput input, CancellationToken ct)
        {
            var rule = await db.AgePriceRules.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (rule is null)
                return Result<AgePriceRuleDto>.Fail(Error.NotFound("Yaş fiyatı bulunamadı."));

            return await saver.Save(null, Guid.Empty, rule, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/age-price-rules/{id:guid}",
                async (Guid id, AgeRuleInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}