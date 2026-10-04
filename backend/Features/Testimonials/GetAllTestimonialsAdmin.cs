using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Testimonials;

public static class GetAllTestimonialsAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<TestimonialDto>> Handle(CancellationToken ct)
        {
            var items = await db.Testimonials.AsNoTracking()
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Take(500)
                .ToListAsync(ct);

            return items.Select(TestimonialDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/testimonials",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}