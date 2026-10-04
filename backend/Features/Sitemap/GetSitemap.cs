using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Sitemap;

public static class GetSitemap
{
    public record Entry(string Slug, DateTime LastModified);

    public record Response(
        List<Entry> Vehicles, List<Entry> DailyTours, List<Entry> CultureTours,
        List<Entry> Bungalows, List<Entry> StaticPages);

    public class Handler(AppDbContext db)
    {
        public async Task<Response> Handle(CancellationToken ct)
        {
            // Hepsi küçük tablolar. Sadece yayındaki kayıtların slug'ı ve son güncelleme tarihi.
            var vehicles = await db.Vehicles.AsNoTracking().Where(x => x.IsActive)
                .Select(x => new { x.Slug, x.CreatedAt, x.UpdatedAt }).ToListAsync(ct);
            var dailyTours = await db.DailyTours.AsNoTracking().Where(x => x.IsActive)
                .Select(x => new { x.Slug, x.CreatedAt, x.UpdatedAt }).ToListAsync(ct);
            var cultureTours = await db.CultureTours.AsNoTracking().Where(x => x.IsActive)
                .Select(x => new { x.Slug, x.CreatedAt, x.UpdatedAt }).ToListAsync(ct);
            var bungalows = await db.Bungalows.AsNoTracking().Where(x => x.IsActive)
                .Select(x => new { x.Slug, x.CreatedAt, x.UpdatedAt }).ToListAsync(ct);
            var pages = await db.StaticPages.AsNoTracking().Where(x => x.IsActive)
                .Select(x => new { x.Slug, x.CreatedAt, x.UpdatedAt }).ToListAsync(ct);

            return new Response(
                vehicles.Select(x => new Entry(x.Slug, x.UpdatedAt ?? x.CreatedAt)).ToList(),
                dailyTours.Select(x => new Entry(x.Slug, x.UpdatedAt ?? x.CreatedAt)).ToList(),
                cultureTours.Select(x => new Entry(x.Slug, x.UpdatedAt ?? x.CreatedAt)).ToList(),
                bungalows.Select(x => new Entry(x.Slug, x.UpdatedAt ?? x.CreatedAt)).ToList(),
                pages.Select(x => new Entry(x.Slug, x.UpdatedAt ?? x.CreatedAt)).ToList());
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/sitemap",
                    async (Handler handler, CancellationToken ct) =>
                        Results.Ok(await handler.Handle(ct)))
                .AllowAnonymous();
    }
}