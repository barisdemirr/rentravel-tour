using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.Auth;

public static class ChangePassword
{
    public record Command(string CurrentPassword, string NewPassword);

    public class Handler(AppDbContext db, IPasswordHasher<AdminUser> hasher)
    {
        public async Task<Result> Handle(Guid userId, Command cmd, CancellationToken ct)
        {
            var validator = new Validator()
                .Required("currentPassword", cmd.CurrentPassword)
                .Required("newPassword", cmd.NewPassword)
                .MinLength("newPassword", cmd.NewPassword, 10)
                .MaxLength("newPassword", cmd.NewPassword, 128);

            if (!validator.IsValid) return validator.ToFailure();

            var user = await db.AdminUsers.FirstOrDefaultAsync(x => x.Id == userId, ct);
            if (user is null)
                return Result.Fail(Error.NotFound("Kullanıcı bulunamadı."));

            if (hasher.VerifyHashedPassword(user, user.PasswordHash, cmd.CurrentPassword) == PasswordVerificationResult.Failed)
                return Result.Fail(Error.Validation(new() { ["currentPassword"] = ["Mevcut şifre hatalı."] }));

            if (cmd.CurrentPassword == cmd.NewPassword)
                return Result.Fail(Error.Validation(new() { ["newPassword"] = ["Yeni şifre mevcut şifreyle aynı olamaz."] }));

            user.PasswordHash = hasher.HashPassword(user, cmd.NewPassword);
            await db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/me/password",
                async (Command cmd, ClaimsPrincipal user, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(user.GetUserId(), cmd, ct)).ToHttp(() => Results.NoContent()));
    }
}