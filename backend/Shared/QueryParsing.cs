namespace Rentravel.Shared;

public static class QueryParsing
{
    public static bool TryParseEnum<T>(string? raw, out T value) where T : struct, Enum =>
        Enum.TryParse(raw, ignoreCase: true, out value) && Enum.IsDefined(value);
}