using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Testimonials;

public static class GetAllTestimonials
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<TestimonialDto>> Handle(int limit, CancellationToken ct)
        {
            var items = await db.Testimonials.AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.OrderIndex)
                .ThenByDescending(x => x.CreatedAt)
                .Take(limit)
                .ToListAsync(ct);

            return items.Select(TestimonialDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/testimonials",
                    async (int? limit, Handler handler, CancellationToken ct) =>
                        Results.Ok(await handler.Handle(Math.Clamp(limit ?? 100, 1, 100), ct)))
                .AllowAnonymous();
    }
}