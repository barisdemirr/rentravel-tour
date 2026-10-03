using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Rentravel.Infrastructure.Database;

public static class JsonConversionExtensions
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public static PropertyBuilder<T> HasJsonConversion<T>(this PropertyBuilder<T> builder)
    {
        var converter = new ValueConverter<T, string>(
            v => JsonSerializer.Serialize(v, Options),
            v => JsonSerializer.Deserialize<T>(v, Options)!);

        // Değişiklik takibi için içerik karşılaştırması (JSON çıktısı üzerinden)
        var comparer = new ValueComparer<T>(
            (a, b) => JsonSerializer.Serialize(a, Options) == JsonSerializer.Serialize(b, Options),
            v => JsonSerializer.Serialize(v, Options).GetHashCode(),
            v => JsonSerializer.Deserialize<T>(JsonSerializer.Serialize(v, Options), Options)!);

        builder.HasConversion(converter, comparer);
        builder.HasColumnType("nvarchar(max)");
        return builder;
    }
}