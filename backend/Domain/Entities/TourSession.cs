using Rentravel.Domain.Enums;

namespace Rentravel.Domain.Entities;

// Tur kalkış tarihi. TourType + TourId ile günübirlik veya kültür turuna bağlanır (FK yok, polimorfik).
public class TourSession : BaseEntity
{
    public TourType TourType { get; set; }
    public Guid TourId { get; set; }

    public DateOnly Date { get; set; }
    public int Seats { get; set; }                 // kalan kontenjan (admin elle yönetir)
    public decimal? PriceOverride { get; set; }    // bu seans için özel kişi başı fiyat
}