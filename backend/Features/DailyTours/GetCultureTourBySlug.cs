using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.CultureTours;

public static class GetCultureTourBySlug
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result<CultureTourDto>> Handle(string slug, CancellationToken ct)
        {
            var key = slug.Trim().ToLowerInvariant();

            var tour = await db.CultureTours.AsNoTracking()
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.IsActive && x.Slug == key, ct);

            return tour is null
                ? Result<CultureTourDto>.Fail(Error.NotFound("Tur bulunamadı."))
                : Result<CultureTourDto>.Success(CultureTourDto.From(tour));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/culture-tours/{slug}",
                    async (string slug, Handler handler, CancellationToken ct) =>
                        (await handler.Handle(slug, ct)).ToHttp(dto => Results.Ok(dto)))
                .AllowAnonymous();
    }
}