namespace Rentravel.Domain.Entities;

public class AdminUser : BaseEntity
{
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string FullName { get; set; } = "";
    public DateTime? LastLoginAt { get; set; }
}