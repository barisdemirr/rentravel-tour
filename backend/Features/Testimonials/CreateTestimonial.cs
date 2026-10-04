using Rentravel.Shared;

namespace Rentravel.Features.Testimonials;

public static class CreateTestimonial
{
    public class Handler(TestimonialSaveHandler saver)
    {
        public Task<Result<TestimonialDto>> Handle(TestimonialInput input, CancellationToken ct) =>
            saver.Save(null, input, ct);
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/testimonials",
                async (TestimonialInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}