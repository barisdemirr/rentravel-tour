/** Yerel saate göre bugünün tarihi (YYYY-MM-DD) */
export const todayISO = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

/** "2027-07-15" + 3 gün -> "2027-07-18" */
export function plusDays(iso, days) {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d + days);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Backend ile aynı kural: 24 saatlik dilimler, kısmi dilim yukarı yuvarlanır. Geçersizse 0. */
export function rentalDays(pickupDate, pickupTime, returnDate, returnTime) {
    if (!pickupDate || !pickupTime || !returnDate || !returnTime) return 0;
    const ms = new Date(`${returnDate}T${returnTime}`) - new Date(`${pickupDate}T${pickupTime}`);
    return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}