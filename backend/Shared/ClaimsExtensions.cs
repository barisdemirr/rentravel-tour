using System.Security.Claims;

namespace Rentravel.Shared;

public static class ClaimsExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
}