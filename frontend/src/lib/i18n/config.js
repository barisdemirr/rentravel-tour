export const LOCALES = ["tr", "ar", "en"];
export const DEFAULT_LOCALE = "tr";

export const DIRECTIONS = { tr: "ltr", en: "ltr", ar: "rtl" };
export const OG_LOCALES = { tr: "tr_TR", en: "en_US", ar: "ar_AR" };

// Sayı ve tarih biçimleri için. Arapçada Latin rakamları kullanılır (₺1,250 gibi)
export const INTL_LOCALES = { tr: "tr-TR", en: "en-US", ar: "ar-u-nu-latn" };

export const isLocale = (value) => LOCALES.includes(value);

/**
 * "/arac-kiralama" + "en" -> "/en/arac-kiralama"
 * Türkçe (varsayılan) öneksizdir. Dış bağlantılar, #anchor, tel: gibi değerler olduğu gibi döner.
 */
export function localizedPath(locale, path) {
    if (typeof path !== "string" || !path.startsWith("/")) return path;
    if (locale === DEFAULT_LOCALE) return path;
    if (path === `/${locale}` || path.startsWith(`/${locale}/`) || path.startsWith(`/${locale}?`)) return path;
    return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** "/en/arac-kiralama" -> "/arac-kiralama" */
export function stripLocale(pathname) {
    const match = pathname.match(/^\/(tr|en|ar)(\/.*)?$/);
    return match ? match[2] || "/" : pathname;
}