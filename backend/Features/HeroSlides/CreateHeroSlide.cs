using Rentravel.Shared;

namespace Rentravel.Features.HeroSlides;

public static class CreateHeroSlide
{
    public class Handler(HeroSlideSaveHandler saver)
    {
        public Task<Result<HeroSlideDto>> Handle(HeroSlideInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/hero-slides",
                async (HeroSlideInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}