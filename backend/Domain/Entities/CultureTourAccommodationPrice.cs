namespace Rentravel.Domain.Entities;

// Kültür turu x konaklama tipi: kişi başı fiyat
public class CultureTourAccommodationPrice : BaseEntity
{
    public Guid CultureTourId { get; set; }
    public CultureTour? CultureTour { get; set; }

    public Guid AccommodationTypeId { get; set; }
    public AccommodationType? AccommodationType { get; set; }

    public decimal PricePerPerson { get; set; }
}