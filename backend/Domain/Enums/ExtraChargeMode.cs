namespace Rentravel.Domain.Enums;

// Ekstra hizmetin fiyatlandırma modu:
//   Once  → tek seferlik, adet başına ücret (oda süsleme, meyve tabağı)
//   Daily → gecelik, rezervasyon gecesi başına ücret (havalimanı transferi, araç kiralama)
public enum ExtraChargeMode
{
    Once = 0,
    Daily = 1
}