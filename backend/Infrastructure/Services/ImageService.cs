using Rentravel.Shared;
using SkiaSharp;

namespace Rentravel.Infrastructure.Services;

public record ProcessedImage(string OriginalPath, string MimeType, long OriginalSize, int Width, int Height);

public class ImageService(IWebHostEnvironment env)
{
    public const long MaxUploadBytes = 10 * 1024 * 1024;
    private const int MaxDimension = 12000;
    private const long MaxPixels = 50_000_000;

    private static readonly (string Suffix, int Width, int Quality)[] Variants =
    [
        ("thumb", 200, 75),
        ("md", 800, 80),
        ("lg", 1600, 80)
    ];

    // /uploads/2026/10/abc.jpg + "lg" -> /uploads/2026/10/abc_lg.webp
    public static string VariantPath(string originalPath, string suffix)
    {
        var dot = originalPath.LastIndexOf('.');
        return $"{originalPath[..dot]}_{suffix}.webp";
    }

    public async Task<Result<ProcessedImage>> SaveAsync(Stream input, CancellationToken ct)
    {
        using var buffer = new MemoryStream();
        await input.CopyToAsync(buffer, ct);

        if (buffer.Length == 0 || buffer.Length > MaxUploadBytes)
            return Invalid("Dosya boş veya 10 MB sınırını aşıyor.");

        buffer.Position = 0;

        // Uzantıya değil içeriğe bakıyoruz: dosya gerçekten bir görsel mi?
        using var codec = SKCodec.Create(buffer);
        if (codec is null)
            return Invalid("Dosya geçerli bir görsel değil.");

        (string? Extension, string? Mime) format = codec.EncodedFormat switch
        {
            SKEncodedImageFormat.Jpeg => (".jpg", "image/jpeg"),
            SKEncodedImageFormat.Png => (".png", "image/png"),
            SKEncodedImageFormat.Webp => (".webp", "image/webp"),
            _ => (null, null)
        };

        if (format.Extension is null)
            return Invalid("Sadece JPEG, PNG ve WebP görseller kabul edilir.");

        var info = codec.Info;
        if (info.Width <= 0 || info.Height <= 0 ||
            info.Width > MaxDimension || info.Height > MaxDimension ||
            (long)info.Width * info.Height > MaxPixels)
            return Invalid("Görsel çok büyük (en fazla 12000 px ve 50 megapiksel).");

        using var decoded = SKBitmap.Decode(codec);
        if (decoded is null)
            return Invalid("Görsel okunamadı.");

        // Telefon fotoğraflarındaki EXIF yönünü uygula (null: döndürmeye gerek yok)
        using var oriented = Orient(decoded, codec.EncodedOrigin);
        var source = oriented ?? decoded;

        var now = DateTime.UtcNow;
        var name = Guid.CreateVersion7().ToString("N");
        var originalUrl = $"/uploads/{now:yyyy}/{now:MM}/{name}{format.Extension}";

        var root = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var directory = Path.Combine(root, "uploads", now.ToString("yyyy"), now.ToString("MM"));
        Directory.CreateDirectory(directory);

        var created = new List<string>();
        try
        {
            // Orijinal olduğu gibi saklanır
            var originalFile = Path.Combine(directory, $"{name}{format.Extension}");
            created.Add(originalFile);
            buffer.Position = 0;
            await using (var fs = File.Create(originalFile))
                await buffer.CopyToAsync(fs, ct);

            // thumbnail / medium / large (WebP). Küçük görsel büyütülmez.
            foreach (var (suffix, width, quality) in Variants)
            {
                var targetWidth = Math.Min(width, source.Width);
                var targetHeight = Math.Max(1, (int)Math.Round(source.Height * (double)targetWidth / source.Width));

                SKBitmap? resized = null;
                try
                {
                    var toEncode = source;
                    if (targetWidth < source.Width)
                    {
                        resized = source.Resize(
                            new SKImageInfo(targetWidth, targetHeight),
                            new SKSamplingOptions(SKCubicResampler.Mitchell));

                        if (resized is null)
                            throw new InvalidOperationException("Görsel yeniden boyutlandırılamadı.");

                        toEncode = resized;
                    }

                    using var image = SKImage.FromBitmap(toEncode);
                    using var data = image.Encode(SKEncodedImageFormat.Webp, quality);

                    var variantFile = Path.Combine(directory, $"{name}_{suffix}.webp");
                    created.Add(variantFile);
                    await using var fs = File.Create(variantFile);
                    data.SaveTo(fs);
                }
                finally
                {
                    resized?.Dispose();
                }
            }
        }
        catch
        {
            // Yarım kalan dosyaları temizle
            foreach (var file in created) TryDelete(file);
            throw;
        }

        return Result<ProcessedImage>.Success(
            new ProcessedImage(originalUrl, format.Mime!, buffer.Length, source.Width, source.Height));
    }

    // Orijinal ve üç varyantı diskten siler (DB kaydı başarısız olursa temizlik için)
    public void Delete(string originalPath)
    {
        TryDelete(ToPhysicalPath(originalPath));
        foreach (var (suffix, _, _) in Variants)
            TryDelete(ToPhysicalPath(VariantPath(originalPath, suffix)));
    }

    private string ToPhysicalPath(string urlPath)
    {
        var root = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        return Path.Combine(root, urlPath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
    }

    private static void TryDelete(string path)
    {
        try { File.Delete(path); } catch { /* temizlik başarısız olursa yut */ }
    }

    private static Result<ProcessedImage> Invalid(string message) =>
        Result<ProcessedImage>.Fail(Error.Validation(new() { ["file"] = [message] }));

    private static SKBitmap? Orient(SKBitmap src, SKEncodedOrigin origin)
    {
        float w = src.Width, h = src.Height;
        SKMatrix matrix;
        var swap = false;

        switch (origin)
        {
            case SKEncodedOrigin.TopRight: matrix = new SKMatrix(-1, 0, w, 0, 1, 0, 0, 0, 1); break;
            case SKEncodedOrigin.BottomRight: matrix = new SKMatrix(-1, 0, w, 0, -1, h, 0, 0, 1); break;
            case SKEncodedOrigin.BottomLeft: matrix = new SKMatrix(1, 0, 0, 0, -1, h, 0, 0, 1); break;
            case SKEncodedOrigin.LeftTop: matrix = new SKMatrix(0, 1, 0, 1, 0, 0, 0, 0, 1); swap = true; break;
            case SKEncodedOrigin.RightTop: matrix = new SKMatrix(0, -1, h, 1, 0, 0, 0, 0, 1); swap = true; break;
            case SKEncodedOrigin.RightBottom: matrix = new SKMatrix(0, -1, h, -1, 0, w, 0, 0, 1); swap = true; break;
            case SKEncodedOrigin.LeftBottom: matrix = new SKMatrix(0, 1, 0, -1, 0, w, 0, 0, 1); swap = true; break;
            default: return null; // TopLeft
        }

        var dst = new SKBitmap(swap ? src.Height : src.Width, swap ? src.Width : src.Height);
        using var canvas = new SKCanvas(dst);
        canvas.SetMatrix(matrix);
        canvas.DrawBitmap(src, 0, 0);
        return dst;
    }
}