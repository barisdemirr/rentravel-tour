using System.Security.Claims;
using Rentravel.Shared;

namespace Rentravel.Features.Auth;

public static class GetCurrentUser
{
    public record Response(Guid Id, string Email, string FullName);

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapGet("/api/admin/me", (ClaimsPrincipal user) =>
                Results.Ok(new Response(
                    Guid.Parse(user.FindFirstValue("sub")!),
                    user.FindFirstValue("email")!,
                    user.FindFirstValue("name")!)));
    }
}