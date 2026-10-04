using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourCategories;

// Panel için: pasif kayıtlar dahil tüm kategoriler (scope filtresi yok)
public static class GetAllTourCategoriesAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<TourCategoryDto>> Handle(CancellationToken ct)
        {
            var categories = await db.TourCategories
                .AsNoTracking()
                .OrderBy(x => x.OrderIndex).ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return categories.Select(TourCategoryDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/tour-categories",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}