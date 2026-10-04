using Rentravel.Domain.Enums;
using Rentravel.Shared;

namespace Rentravel.Features.AgePriceRules;

public static class CreateAgePriceRule
{
    public record Command : AgeRuleInput
    {
        public PriceOwnerType? OwnerType { get; init; }
        public Guid OwnerId { get; init; }
    }

    public class Handler(AgePriceRuleSaveHandler saver)
    {
        public Task<Result<AgePriceRuleDto>> Handle(Command cmd, CancellationToken ct) =>
            saver.Save(cmd.OwnerType, cmd.OwnerId, null, cmd, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/age-price-rules",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}