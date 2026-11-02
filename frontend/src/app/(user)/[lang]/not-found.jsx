"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import NotFoundView from "@/components/sections/NotFoundView";

/**
 * Dil, layout'un verdiği LanguageProvider'dan okunur.
 *
 * DİKKAT: Burada headers() / cookies() KULLANMA. not-found bileşeni her sayfanın ağacına
 * eklendiği için tek bir headers() çağrısı sitenin TÜM sayfalarını "her istekte yeniden üret"
 * moduna sokuyordu (önbellek hiç çalışmıyordu, Vercel faturası buradan şişti).
 */
export default function LocaleNotFound() {
    const { t, locale } = useLanguage();
    return <NotFoundView dict={t} locale={locale} />;
}
