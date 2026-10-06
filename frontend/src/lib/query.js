/**
 * URL sorgu parametrelerini güvenle okuma yardımcıları.
 * useSearchParams yerine window.location kullanılır: Suspense sınırı gerektirmez,
 * statik derlemede hata vermez. Yalnızca useEffect içinde çağrılmalı.
 */
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function readQuery() {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
}

/** Geçerli YYYY-MM-DD ve (verildiyse) min tarihten önce değil */
export const isDate = (value, min) => DATE.test(value ?? "") && (!min || value >= min);

export const isTime = (value) => TIME.test(value ?? "");

export function toInt(value, min, max, fallback) {
    const n = Number.parseInt(value, 10);
    return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/** "5,8,12" -> [5, 8, 12]; geçersizleri atar, en fazla 5 çocuk */
export function toAges(value) {
    return (value ?? "")
        .split(",")
        .map((x) => Number.parseInt(x, 10))
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 17)
        .slice(0, 5);
}