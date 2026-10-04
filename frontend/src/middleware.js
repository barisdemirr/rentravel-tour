import { NextResponse } from "next/server";

const LOCALES = ["tr", "ar", "en"];
const DEFAULT_LOCALE = "tr";

export function middleware(request) {
    const { pathname } = request.nextUrl;
    const first = pathname.split("/")[1];

    // /tr/... adresi kopya içerik olmasın diye öneksiz adrese yönlenir
    if (first === DEFAULT_LOCALE) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
        return NextResponse.redirect(url, 308);
    }

    // /en/... ve /ar/... doğrudan [lang] rotasına gider
    if (LOCALES.includes(first)) return NextResponse.next();

    // Öneksiz adresler Türkçedir: içeride /tr/... olarak yeniden yazılır, tarayıcıda adres değişmez
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.rewrite(url);
}

export const config = {
    // Statik dosyalar (noktalı), _next, api ve admin dışındaki her şey
    matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};