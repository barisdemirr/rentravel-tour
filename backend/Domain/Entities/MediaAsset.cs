using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

public class MediaAsset : BaseEntity
{
    public MediaCategory Category { get; set; } = MediaCategory.General;
    public string FileName { get; set; } = "";      // yüklenen dosyanın adı (sadece gösterim için)
    public string FilePath { get; set; } = "";      // orijinalin yolu: /uploads/2026/10/{guid}.jpg
    public string MimeType { get; set; } = "";
    public long FileSize { get; set; }              // orijinalin boyutu (byte)
    public int Width { get; set; }
    public int Height { get; set; }
    public LocalizedText? AltText { get; set; }
    public Guid? UploadedBy { get; set; }
}