using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AdminUsers;

public static class GetAllAdminUsers
{
    public class Handler(AppDbContext db)
    {
        public async Task<List<AdminUserDto>> Handle(CancellationToken ct)
        {
            var users = await db.AdminUsers
                .AsNoTracking()
                .OrderBy(x => x.CreatedAt)
                .ToListAsync(ct);

            return users.Select(AdminUserDto.From).ToList();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/users",
                async (Handler handler, CancellationToken ct) =>
                    Results.Ok(await handler.Handle(ct)));
    }
}