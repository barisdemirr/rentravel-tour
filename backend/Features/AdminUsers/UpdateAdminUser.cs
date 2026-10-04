using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AdminUsers;

public static class UpdateAdminUser
{
    public record Command(string Email, string FullName, bool IsActive);

    public class Handler(AppDbContext db)
    {
        public async Task<Result<AdminUserDto>> Handle(Guid id, Guid currentUserId, Command cmd, CancellationToken ct)
        {
            var user = await db.AdminUsers.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (user is null)
                return Result<AdminUserDto>.Fail(Error.NotFound("Kullanıcı bulunamadı."));

            if (id == currentUserId && !cmd.IsActive)
                return Result<AdminUserDto>.Fail(Error.Conflict("Kendi hesabınızı pasife alamazsınız."));

            var email = (cmd.Email ?? "").Trim().ToLowerInvariant();
            var fullName = (cmd.FullName ?? "").Trim();

            var validator = new Validator()
                .Required("email", email).MaxLength("email", email, 256).Email("email", email)
                .Required("fullName", fullName).MaxLength("fullName", fullName, 100);

            if (!validator.IsValid) return validator.ToFailure<AdminUserDto>();

            if (await db.AdminUsers.AnyAsync(x => x.Email == email && x.Id != id, ct))
                return Result<AdminUserDto>.Fail(Error.Conflict($"'{email}' adresi zaten kullanılıyor."));

            user.Email = email;
            user.FullName = fullName;
            user.IsActive = cmd.IsActive;

            await db.SaveChangesAsync(ct);

            return Result<AdminUserDto>.Success(AdminUserDto.From(user));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPut("/api/admin/users/{id:guid}",
                async (Guid id, Command cmd, ClaimsPrincipal user, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(id, user.GetUserId(), cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}