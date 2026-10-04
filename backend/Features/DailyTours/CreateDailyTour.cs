using Rentravel.Features.Tours;
using Rentravel.Shared;

namespace Rentravel.Features.DailyTours;

public static class CreateDailyTour
{
    public class Handler(DailyTourSaveHandler saver)
    {
        public Task<Result<TourDto>> Handle(TourInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/daily-tours",
                async (TourInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}