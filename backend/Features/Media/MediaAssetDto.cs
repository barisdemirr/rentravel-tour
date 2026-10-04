using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Services;

namespace Rentravel.Features.Media;

public record MediaUrls(string Original, string Thumbnail, string Medium, string Large)
{
    public static MediaUrls From(string originalPath) => new(
        originalPath,
        ImageService.VariantPath(originalPath, "thumb"),
        ImageService.VariantPath(originalPath, "md"),
        ImageService.VariantPath(originalPath, "lg"));
}

public record MediaAssetDto(
    Guid Id, MediaCategory Category, string FileName, string MimeType, long FileSize,
    int Width, int Height, LocalizedText? AltText, MediaUrls Urls, bool IsActive, DateTime CreatedAt)
{
    public static MediaAssetDto From(MediaAsset a) =>
        new(a.Id, a.Category, a.FileName, a.MimeType, a.FileSize, a.Width, a.Height,
            a.AltText, MediaUrls.From(a.FilePath), a.IsActive, a.CreatedAt);
}