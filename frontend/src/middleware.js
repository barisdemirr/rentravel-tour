import { NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

const ADMIN_COOKIE = "rt_admin";

/**
 * JWT süresini kontrol eder. İmza burada doğrulanamaz (anahtar backend'de);
 * imzası geçersiz bir token backend'den 401 alır ve login'e ?expired=1 ile döner.
 */
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

/** Çerezi siler: ayar, oluşturulduğu yolla aynı olmalı */
function clearSession(response) {
    response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
}

/** Panel yanıtları hiçbir koşulda önbelleğe alınmasın, dizine eklenmesin */
function adminHeaders(response) {
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
}

/* ───────────────────────────── ADMIN ───────────────────────────── */
function handleAdmin(request) {
    const { pathname, search, searchParams } = request.nextUrl;
    const isLoginPage = pathname === "/admin/login";

    // Backend token'ı reddetti: çerezi sil, login'i göster, geri yönlendirme yapma (döngü kırılır)
    if (isLoginPage && searchParams.get("expired") === "1") {
        return adminHeaders(clearSession(NextResponse.next()));
    }

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
        return clearSession(NextResponse.redirect(url)); // süresi dolmuş çerezi temizle
    }

    return adminHeaders(NextResponse.next());
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