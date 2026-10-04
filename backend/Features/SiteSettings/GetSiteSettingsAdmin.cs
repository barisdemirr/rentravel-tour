using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.SiteSettings;

public static class GetSiteSettingsAdmin
{
    public class Handler(AppDbContext db)
    {
        public async Task<SiteSettingsDto> Handle(CancellationToken ct)
        {
            var settings = await db.SiteSettings.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == SiteSetting.SingletonId, ct);

            return SiteSettingsDto.From(settings);
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/site-settings",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}