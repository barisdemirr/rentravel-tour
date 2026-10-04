"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { interpolate } from "./dictionaries";
import { getDictionary } from "./getDictionary";
import { DIRECTIONS, LOCALES, isLocale, localizedPath, stripLocale } from "./config";

const LanguageContext = createContext(null);

export function LanguageProvider({ locale, children }) {
    const pathname = usePathname();
    const router = useRouter();

    const value = useMemo(
        () => ({
            locale, // "tr" | "en" | "ar" (adresler, backend alanları)
            lang: locale.toUpperCase(), // "TR" | "EN" | "AR" (menü ve sözlük anahtarları)
            dir: DIRECTIONS[locale],
            isRtl: DIRECTIONS[locale] === "rtl",
            supported: LOCALES.map((l) => l.toUpperCase()),
            t: getDictionary(locale),
            tpl: interpolate,
            // Dile uygun iç bağlantı: href("/arac-kiralama") -> "/en/arac-kiralama"
            href: (path) => localizedPath(locale, path),
            // Aynı sayfayı seçilen dilde açar (arama ve # korunur)
            setLang: (next) => {
                const target = String(next).toLowerCase();
                if (!isLocale(target) || target === locale) return;

                const path = localizedPath(target, stripLocale(pathname));
                router.push(`${path}${window.location.search}${window.location.hash}`);
            },
        }),
        [locale, pathname, router]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
    return ctx;
}