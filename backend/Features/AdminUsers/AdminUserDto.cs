using Rentravel.Domain.Entities;

namespace Rentravel.Features.AdminUsers;

public record AdminUserDto(Guid Id, string Email, string FullName, bool IsActive, DateTime? LastLoginAt, DateTime CreatedAt)
{
    public static AdminUserDto From(AdminUser u) =>
        new(u.Id, u.Email, u.FullName, u.IsActive, u.LastLoginAt, u.CreatedAt);
}