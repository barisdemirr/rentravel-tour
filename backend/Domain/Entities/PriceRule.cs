using Rentravel.Domain.Enums;
using Rentravel.Domain.ValueObjects;

namespace Rentravel.Domain.Entities;

// Tarihe göre fiyat. Sahibi OwnerType + OwnerId ile belirlenir (FK yok, polimorfik).
// Fiyatın anlamı sahip tipinden gelir: araç günlük, bungalov gecelik, tur kişi başı.
// Para birimi ürünün para birimidir.
public class PriceRule : BaseEntity
{
    public PriceOwnerType OwnerType { get; set; }
    public Guid OwnerId { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }   // dahil
    public decimal Price { get; set; }

    // Çakışmada yüksek Priority kazanır, eşitse en son eklenen
    public int Priority { get; set; }

    public LocalizedText? Label { get; set; }   // "Yaz Sezonu", "Yılbaşı Özel"
}