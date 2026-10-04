using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Rentravel.Domain.Entities;
using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;
using Rentravel.Infrastructure.Database;
using Rentravel.Infrastructure.Services;
using Rentravel.Shared;

namespace Rentravel.Features.Media;

public static class UploadMedia
{
    public record Command(IFormFile? File, string? Category, LocalizedText? Alt);

    public class Handler(AppDbContext db, ImageService images)
    {
        public async Task<Result<MediaAssetDto>> Handle(Command cmd, Guid userId, CancellationToken ct)
        {
            var category = MediaCategory.General;

            var validator = new Validator()
                .Must("file", cmd.File is { Length: > 0 }, "file zorunludur.")
                .Must("file", cmd.File is null || cmd.File.Length <= ImageService.MaxUploadBytes,
                      "Dosya en fazla 10 MB olabilir.")
                // category boşsa General kalır, doluysa parse edilir (büyük/küçük harf fark etmez)
                .Must("category",
                      string.IsNullOrWhiteSpace(cmd.Category)
                          || (Enum.TryParse(cmd.Category, true, out category) && Enum.IsDefined(category)),
                      "category geçersiz (General, DailyTour, CultureTour, Vehicle, Bungalow).")
                .Must("alt.tr", cmd.Alt is null || !string.IsNullOrWhiteSpace(cmd.Alt.Tr),
                      "alt verildiyse alt.tr zorunludur.");

            if (!validator.IsValid) return validator.ToFailure<MediaAssetDto>();

            await using var stream = cmd.File!.OpenReadStream();
            var processed = await images.SaveAsync(stream, ct);
            if (!processed.IsSuccess)
                return Result<MediaAssetDto>.Fail(processed.Error!);

            var image = processed.Value!;

            var asset = new MediaAsset
            {
                Category = category,
                FileName = SanitizeFileName(cmd.File.FileName),
                FilePath = image.OriginalPath,
                MimeType = image.MimeType,
                FileSize = image.OriginalSize,
                Width = image.Width,
                Height = image.Height,
                AltText = cmd.Alt,
                UploadedBy = userId
            };

            try
            {
                db.MediaAssets.Add(asset);
                await db.SaveChangesAsync(ct);
            }
            catch
            {
                images.Delete(image.OriginalPath); // DB kaydı olmayan dosya kalmasın
                throw;
            }

            return Result<MediaAssetDto>.Success(MediaAssetDto.From(asset));
        }

        private static string SanitizeFileName(string? name)
        {
            var fileName = Path.GetFileName(name ?? "");
            if (string.IsNullOrWhiteSpace(fileName)) fileName = "image";
            return fileName.Length > 255 ? fileName[..255] : fileName;
        }
    }

    public class Endpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app) =>
            app.MapPost("/api/admin/media",
                    async (IFormCollection form, ClaimsPrincipal user, Handler handler, CancellationToken ct) =>
                    {
                        var altTr = Clean(form["altTr"]);
                        var altEn = Clean(form["altEn"]);
                        var altAr = Clean(form["altAr"]);

                        LocalizedText? alt = altTr is null && altEn is null && altAr is null
                            ? null
                            : new LocalizedText { Tr = altTr ?? "", En = altEn, Ar = altAr };

                        var cmd = new Command(form.Files.GetFile("file"), Clean(form["category"]), alt);

                        return (await handler.Handle(cmd, user.GetUserId(), ct))
                            .ToHttp(dto => Results.Ok(dto));
                    })
                .DisableAntiforgery() // kimlik doğrulama JWT header'ıyla, çerez yok: CSRF söz konusu değil
                .WithMetadata(new RequestSizeLimitAttribute(15 * 1024 * 1024));

        private static string? Clean(string? value) =>
            string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}