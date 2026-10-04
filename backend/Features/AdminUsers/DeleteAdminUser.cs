using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AdminUsers;

public static class DeleteAdminUser
{
    public class Handler(AppDbContext db)
    {
        public async Task<Result> Handle(Guid id, Guid currentUserId, CancellationToken ct)
        {
            if (id == currentUserId)
                return Result.Fail(Error.Conflict("Kendi hesabınızı silemezsiniz."));

            var user = await db.AdminUsers.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (user is null)
                return Result.Fail(Error.NotFound("Kullanıcı bulunamadı."));

            db.AdminUsers.Remove(user); // soft delete'e çevrilir
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapDelete("/api/admin/users/{id:guid}",
                async (Guid id, ClaimsPrincipal user, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, user.GetUserId(), ct)).ToHttp(() => Results.NoContent()));
    }
}