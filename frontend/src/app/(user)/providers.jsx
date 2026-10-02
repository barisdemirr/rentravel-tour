"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";

export function Providers({ children }) {
    return <LanguageProvider>{children}</LanguageProvider>;
}