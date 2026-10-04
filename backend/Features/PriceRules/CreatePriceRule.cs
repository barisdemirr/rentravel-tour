using Rentravel.Domain.Enums;
using Rentravel.Shared;

namespace Rentravel.Features.PriceRules;

public static class CreatePriceRule
{
    public record Command : PriceRuleInput
    {
        public PriceOwnerType? OwnerType { get; init; }
        public Guid OwnerId { get; init; }
    }

    public class Handler(PriceRuleSaveHandler saver)
    {
        public Task<Result<PriceRuleDto>> Handle(Command cmd, CancellationToken ct) =>
            saver.Save(cmd.OwnerType, cmd.OwnerId, null, cmd, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/price-rules",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}