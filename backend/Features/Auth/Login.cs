using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rentravel.Domain.Entities;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.Auth;

public static class Login
{
    public record Command(string Email, string Password);

    public record UserInfo(Guid Id, string Email, string FullName);

    public record Response(string AccessToken, DateTime ExpiresAt, UserInfo User);

    public class Handler(AppDbContext db, IPasswordHasher<AdminUser> hasher, TokenService tokens)
    {
        // Kullanıcı bulunamasa da doğrulama yapılır: yanıt süresi kullanıcı varlığını belli etmesin
        private static readonly Lazy<string> DummyHash =
            new(() => new PasswordHasher<AdminUser>().HashPassword(new AdminUser(), "dummy-password"));

        public async Task<Result<Response>> Handle(Command cmd, CancellationToken ct)
        {
            var email = (cmd.Email ?? "").Trim().ToLowerInvariant();

            var validator = new Validator()
                .Required("email", email).MaxLength("email", email, 256)
                .Required("password", cmd.Password).MaxLength("password", cmd.Password, 128);

            if (!validator.IsValid) return validator.ToFailure<Response>();

            var user = await db.AdminUsers.FirstOrDefaultAsync(x => x.Email == email, ct);

            var verification = hasher.VerifyHashedPassword(
                user ?? new AdminUser(), user?.PasswordHash ?? DummyHash.Value, cmd.Password);

            if (user is null || !user.IsActive || verification == PasswordVerificationResult.Failed)
                return Result<Response>.Fail(Error.Unauthorized("E-posta veya şifre hatalı."));

            user.LastLoginAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);

            var (token, expiresAt) = tokens.Create(user);

            return Result<Response>.Success(
                new Response(token, expiresAt, new UserInfo(user.Id, user.Email, user.FullName)));
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/auth/login",
                async (Command cmd, Handler handler, CancellationToken ct) =>
                    (await handler.Handle(cmd, ct)).ToHttp(response => Results.Ok(response)))
                .AllowAnonymous()
                .RequireRateLimiting("login");
    }
}