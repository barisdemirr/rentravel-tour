using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.TourCategories;

public static class GetAllTourCategories
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<TourCategoryDto>> Handle(TourCategoryScope? scope, CancellationToken ct)
        {
            var query = db.TourCategories.AsNoTracking().Where(x => x.IsActive);

            if (scope is not null)
                query = query.Where(x => x.AppliesTo == scope || x.AppliesTo == TourCategoryScope.Both);

            var categories = await query
                .OrderBy(x => x.OrderIndex)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return categories.Select(TourCategoryDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/tour-categories",
                async (string? scope, Handler handler, CancellationToken ct) =>
                {
                    TourCategoryScope? parsed = null;

                    if (!string.IsNullOrWhiteSpace(scope))
                    {
                        if (!Enum.TryParse<TourCategoryScope>(scope, ignoreCase: true, out var value)
                            || !Enum.IsDefined(value))
                        {
                            return Results.ValidationProblem(new Dictionary<string, string[]>
                            {
                                ["scope"] = ["scope geçersiz (Daily, Culture, Both)."]
                            });
                        }

                        parsed = value;
                    }

                    return Results.Ok(await handler.Handle(parsed, ct));
                }).AllowAnonymous();
    }
}