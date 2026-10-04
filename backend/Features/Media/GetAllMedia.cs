using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Enums;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Media;

public static class GetAllMedia
{
    public class Handler(AppDbContext db)
    {
        public async Task<PagedResult<MediaAssetDto>> Handle(
            MediaCategory? category, int page, int pageSize, CancellationToken ct)
        {
            var query = db.MediaAssets.AsNoTracking().AsQueryable();

            if (category is not null)
                query = query.Where(x => x.Category == category);

            var total = await query.CountAsync(ct);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .ThenByDescending(x => x.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(ct);

            return new PagedResult<MediaAssetDto>(items.Select(MediaAssetDto.From).ToList(), total, page, pageSize);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/media",
                async (string? category, int? page, int? pageSize, Handler handler, CancellationToken ct) =>
                {
                    MediaCategory? parsed = null;

                    if (!string.IsNullOrWhiteSpace(category))
                    {
                        if (!Enum.TryParse<MediaCategory>(category, ignoreCase: true, out var value)
                            || !Enum.IsDefined(value))
                        {
                            return Results.ValidationProblem(new Dictionary<string, string[]>
                            {
                                ["category"] = ["category geçersiz (General, DailyTour, CultureTour, Vehicle, Bungalow)."]
                            });
                        }

                        parsed = value;
                    }

                    var currentPage = Math.Max(page ?? 1, 1);
                    var size = Math.Clamp(pageSize ?? 48, 1, 100);

                    return Results.Ok(await handler.Handle(parsed, currentPage, size, ct));
                });
    }
}