import { SITE_URL } from "@/lib/siteUrl";
import { LOCALES } from "@/lib/i18n/config";
import { getSitemapData } from "@/services";

export const revalidate = 3600; // saatte bir yenilenir

/** Dil öneki: TR kökte, diğerleri /en, /ar */
const localized = (locale, path) => (locale === "tr" ? path : `/${locale}${path === "/" ? "" : path}`);

/** XML'de özel karakterler kaçırılmalı */
const esc = (s) =>
    String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const url = (locale, path) => esc(`${SITE_URL}${localized(locale, path)}`);

/** Ana sayfa en yüksek, liste sayfaları yüksek, detaylar normal öncelikli */
function priorityOf(path) {
    if (path === "/") return "1.0";
    if (path.split("/").length === 2) return "0.9"; // /arac-kiralama gibi liste sayfaları
    return "0.7";
}

/** Değişim sıklığı: fiyat ve stok değişen ürün sayfaları daha sık taranmalı */
function changefreqOf(path) {
    if (path === "/") return "daily";
    if (path.split("/").length === 2) return "daily";
    return "weekly";
}

/**
 * Bir sayfanın üç dil sürümü için üç ayrı <url> girdisi üretir.
 * Google her sürümün kendisi dahil tüm dilleri listelemesini istiyor.
 */
function urlEntries(path, lastModified) {
    const alternates = [
        ...LOCALES.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, path)}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${url("tr", path)}"/>`,
    ].join("\n");

    const date = lastModified ? new Date(lastModified) : null;
    const lastmod =
        date && !Number.isNaN(date.getTime()) ? `\n    <lastmod>${date.toISOString()}</lastmod>` : "";

    const priority = priorityOf(path);
    const changefreq = changefreqOf(path);

    return LOCALES.map(
        (locale) => `  <url>
    <loc>${url(locale, path)}</loc>${lastmod}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
  </url>`
    );
}

/** İçerikten bağımsız sabit sayfalar */
const STATIC_PATHS = [
    "/",
    "/arac-kiralama",
    "/gunubirlik-turlar",
    "/konaklamali-turlar",
    "/bungalov-konaklama",
    "/hakkimizda",
    "/iletisim",
    "/vip-talep",
];

export async function GET() {
    let data = null;

    try {
        data = await getSitemapData();
    } catch (error) {
        // Backend kapalıysa en azından sabit sayfalar yayınlanır
        console.error("[sitemap] veri alınamadı:", error?.message);
    }

    const entries = [
        ...STATIC_PATHS.flatMap((path) => urlEntries(path)),
        ...(data?.vehicles ?? []).flatMap((v) => urlEntries(`/arac-kiralama/${v.slug}`, v.lastModified)),
        ...(data?.dailyTours ?? []).flatMap((t) => urlEntries(`/gunubirlik-turlar/${t.slug}`, t.lastModified)),
        ...(data?.cultureTours ?? []).flatMap((t) => urlEntries(`/konaklamali-turlar/${t.slug}`, t.lastModified)),
        ...(data?.bungalows ?? []).flatMap((b) => urlEntries(`/bungalov-konaklama/${b.slug}`, b.lastModified)),
        ...(data?.staticPages ?? []).flatMap((p) => urlEntries(`/${p.slug}`, p.lastModified)),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        },
    });
}