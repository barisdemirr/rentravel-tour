import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

const ADMIN_COOKIE = "rt_admin";

/** JWT süresini kontrol eder (imza backend'de doğrulanır). */
function tokenValid(token) {
    if (!token) return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    try {
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        return typeof payload.exp === "number" && payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

/* ───────────────────────────── ADMIN ───────────────────────────── */
function handleAdmin(request) {
    const { pathname, search } = request.nextUrl;
    const isLoginPage = pathname === "/admin/login";
    const signedIn = tokenValid(request.cookies.get(ADMIN_COOKIE)?.value);

    // Giriş yapılmışsa login sayfası görülmez
    if (isLoginPage && signedIn) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Giriş yapılmamışsa login dışındaki her admin sayfası login'e gider
    if (!isLoginPage && !signedIn) {
        const url = new URL("/admin/login", request.url);
        const from = pathname + search;
        if (from !== "/admin") url.searchParams.set("from", from); // girişten sonra geri dön
        const response = NextResponse.redirect(url);
        response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 }); // süresi dolmuş çerezi temizle
        return response;
    }

    // Panel sayfaları hiçbir koşulda önbelleğe alınmasın
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
}

/* ───────────────────────────── SITE (i18n) ───────────────────────────── */
function handleSite(request) {
    const { pathname } = request.nextUrl;
    const first = pathname.split("/")[1];

    // /tr/... adresi kopya içerik olmasın diye öneksiz adrese yönlenir (kalıcı 308)
    if (first === DEFAULT_LOCALE) {
        const url = request.nextUrl.clone();
        url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";
        return NextResponse.redirect(url, 308);
    }

    // /en/... ve /ar/... doğrudan [lang] rotasına gider
    if (LOCALES.includes(first)) {
        const response = NextResponse.next();
        response.headers.set("x-locale", first);
        return response;
    }

    // Öneksiz adresler Türkçedir: içeride /tr/... olarak yeniden yazılır, tarayıcıda adres değişmez
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${DEFAULT_LOCALE}` : `/${DEFAULT_LOCALE}${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("x-locale", DEFAULT_LOCALE);
    return response;
}

/* ───────────────────────────── MIDDLEWARE ───────────────────────────── */
export function middleware(request) {
    const { pathname } = request.nextUrl;

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
        return handleAdmin(request);
    }

    return handleSite(request);
}

export const config = {
    // api, _next, sitemap.xml, robots.txt ve dosya uzantılı istekler hariç
    matcher: ["/((?!api|_next|sitemap\\.xml|robots\\.txt|.*\\..*).*)"],
};