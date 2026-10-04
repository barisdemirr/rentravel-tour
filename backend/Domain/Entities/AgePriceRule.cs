using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

// Yaş grubuna göre fiyat (tur ve bungalov). Aralıklar aynı sahip için çakışmaz.
public class AgePriceRule : BaseEntity
{
    public PriceOwnerType OwnerType { get; set; }
    public Guid OwnerId { get; set; }

    public int MinAge { get; set; }
    public int MaxAge { get; set; }

    public AgePriceType Type { get; set; }
    public decimal? Price { get; set; }        // Type = Fixed ise
    public decimal? Percentage { get; set; }   // Type = Percentage ise (yetişkin fiyatının yüzdesi)

    public LocalizedText Label { get; set; } = new();   // "Bebek (0-2 yaş)"
}