using Rentravel.Domain.Entities;
using Rentravel.Shared;

namespace Rentravel.Features.Tours;

public static class SessionAvailability
{
    // Turun seansı varsa sadece aktif seans tarihleri rezerve edilebilir ve kontenjan kontrol edilir.
    // Hiç seansı olmayan turda herhangi bir tarih seçilebilir. Tarihe uyan seansı döndürür (yoksa null).
    public static TourSession? Check(IReadOnlyCollection<TourSession> sessions, DateOnly date, int guests, Validator v)
    {
        if (sessions.Count == 0) return null;

        var session = sessions.FirstOrDefault(s => s.Date == date && s.IsActive);

        if (session is null)
        {
            v.AddError("date", "Bu tur için seçilen tarihte kalkış yok.");
            return null;
        }

        if (session.Seats < guests)
            v.AddError("adults", session.Seats == 0
                ? "Bu kalkış dolu."
                : $"Yeterli kontenjan yok (kalan: {session.Seats}).");

        return session;
    }
}