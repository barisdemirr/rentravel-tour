using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Testimonials;

public static class UpdateTestimonial
{
    public class Handler(AppDbContext db, TestimonialSaveHandler saver)
    {
        public async Task<Result<TestimonialDto>> Handle(Guid id, TestimonialInput input, CancellationToken ct)
        {
            var testimonial = await db.Testimonials.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (testimonial is null)
                return Result<TestimonialDto>.Fail(Error.NotFound("Yorum bulunamadı."));

            return await saver.Save(testimonial, input, ct);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/testimonials/{id:guid}",
                async (Guid id, TestimonialInput input, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, input, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}