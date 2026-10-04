using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class CreateCultureTour
{
    public class Handler(CultureTourSaveHandler saver)
    {
        public Task<Result<CultureTourDto>> Handle(CultureTourInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/culture-tours",
                async (CultureTourInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}