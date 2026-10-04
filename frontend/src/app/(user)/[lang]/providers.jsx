"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export function Providers({ locale, children }) {
    return <LanguageProvider locale={locale}>{children}</LanguageProvider>;
}