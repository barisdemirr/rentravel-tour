using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourCategories;

public static class DeleteTourCategory
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, CancellationToken ct)
        {
            var category = await db.TourCategories.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (category is null)
                return Result.Fail(Error.NotFound("Kategori bulunamadı."));

            db.TourCategories.Remove(category); // soft delete'e çevrilir
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/tour-categories/{id:guid}",
                async (Guid id, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, ct)).ToHttp(() => Results.NoContent()));
    }
}