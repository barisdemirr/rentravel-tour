import { INTL_LOCALES } from "@/lib/i18n/config";

const SYMBOLS = { TRY: "₺", USD: "$", EUR: "€" };

/**
 * formatPrice(8850, "TRY", "tr")                    -> "₺8.850"
 * formatPrice(8850, "TRY", "tr", { suffix: true })  -> "8.850 ₺"  (WhatsApp mesajları için)
 */
export function formatPrice(amount, currency = "TRY", locale = "tr", { suffix = false } = {}) {
    if (amount == null || Number.isNaN(Number(amount))) return "";

    const number = new Intl.NumberFormat(INTL_LOCALES[locale] ?? INTL_LOCALES.tr, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(amount));

    const symbol = SYMBOLS[currency] ?? currency;
    return suffix ? `${number} ${symbol}` : `${symbol}${number}`;
}

/** "YYYY-MM-DD" metnini saat dilimi kayması olmadan yerel tarihe çevirir */
export function parseDateOnly(value) {
    if (value instanceof Date) return value;
    const [y, m, d] = String(value).split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** formatDate("2027-07-15", "tr") -> "15 Temmuz 2027" */
export function formatDate(value, locale = "tr", options = { day: "numeric", month: "long", year: "numeric" }) {
    if (!value) return "";
    return new Intl.DateTimeFormat(INTL_LOCALES[locale] ?? INTL_LOCALES.tr, options).format(parseDateOnly(value));
}