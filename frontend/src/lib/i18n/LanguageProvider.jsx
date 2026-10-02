"use client";

import { createContext, useContext, useMemo } from "react";
import { dictionaries, interpolate } from "./dictionaries";

const LanguageContext = createContext(null);

const SUPPORTED = ["TR", "AR", "EN"];
const LOCKED_LANG = "TR"; // Backend hazır olana kadar TR'de kilitli

export function LanguageProvider({ children }) {
    const value = useMemo(() => ({
        lang: LOCKED_LANG,
        setLang: () => { }, // no-op
        supported: SUPPORTED,
        t: dictionaries[LOCKED_LANG],
        tpl: interpolate,
    }), []);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
    return ctx;
}