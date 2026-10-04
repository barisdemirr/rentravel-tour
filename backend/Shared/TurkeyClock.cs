namespace Rentravel.Shared;

public static class TurkeyClock
{
    // Türkiye kalıcı olarak UTC+3
    public static DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3));
}