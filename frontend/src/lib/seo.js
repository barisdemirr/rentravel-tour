import { DEFAULT_LOCALE, LOCALES, localizedPath } from "@/lib/i18n/config";

/** Sayfaya özel canonical ve hreflang adresleri. path: dilden bağımsız yol ("/arac-kiralama") */
export function buildAlternates(path, locale) {
    const languages = Object.fromEntries(LOCALES.map((l) => [l, localizedPath(l, path)]));
    languages["x-default"] = localizedPath(DEFAULT_LOCALE, path);
    return { canonical: localizedPath(locale, path), languages };
}