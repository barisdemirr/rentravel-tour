namespace Rentravel.Features.Tours;

// Tarih seçici için: tarih, kalan kontenjan (0 = dolu), günübirlik turda o tarihin yetişkin fiyatı
public record PublicSessionDto(DateOnly Date, int Seats, decimal? UnitPrice);