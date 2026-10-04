"use client";

import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { NavigationProvider } from "@/lib/navigation/NavigationProvider";

export function Providers({ locale, children }) {
    return (
        <NavigationProvider>
            <LanguageProvider locale={locale}>{children}</LanguageProvider>
        </NavigationProvider>
    );
}