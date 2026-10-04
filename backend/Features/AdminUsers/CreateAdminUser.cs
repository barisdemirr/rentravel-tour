using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Shared;

namespace Rentravel.Features.AdminUsers;

public static class CreateAdminUser
{
    public record Command(string Email, string FullName, string Password);

    public class Handler(AppDbContext db, IPasswordHasher<AdminUser> hasher)
    {
        public async Task<Result<AdminUserDto>> Handle(Command cmd, CancellationToken ct)
        {
            var email = (cmd.Email ?? "").Trim().ToLowerInvariant();
            var fullName = (cmd.FullName ?? "").Trim();

            var validator = new Validator()
                .Required("email", email).MaxLength("email", email, 256).Email("email", email)
                .Required("fullName", fullName).MaxLength("fullName", fullName, 100)
                .Required("password", cmd.Password)
                .MinLength("password", cmd.Password, 10).MaxLength("password", cmd.Password, 128);

            if (!validator.IsValid) return validator.ToFailure<AdminUserDto>();

            if (await db.AdminUsers.AnyAsync(x => x.Email == email, ct))
                return Result<AdminUserDto>.Fail(Error.Conflict($"'{email}' adresi zaten kullanılıyor."));

            var user = new AdminUser { Email = email, FullName = fullName };
            user.PasswordHash = hasher.HashPassword(user, cmd.Password);

            db.AdminUsers.Add(user);
            await db.SaveChangesAsync(ct);

            return Result<AdminUserDto>.Success(AdminUserDto.From(user));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/users",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(dto => Results.Ok(dto)));
    }
}