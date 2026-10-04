import { SITE_URL } from "@/lib/siteUrl";
import { LOCALES } from "@/lib/i18n/config";
import { getSitemapData } from "@/services";

export const revalidate = 3600; // saatte bir yenilenir

/** Dil öneki: TR kökte, diğerleri /en, /ar */
const localized = (locale, path) => (locale === "tr" ? path : `/${locale}${path === "/" ? "" : path}`);

/** Her sayfanın üç dil karşılığını hreflang olarak verir */
function urlEntry(path, lastModified) {
    const alternates = LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${localized(l, path)}"/>`
    ).join("\n");

    const lastmod = lastModified ? `\n    <lastmod>${new Date(lastModified).toISOString()}</lastmod>` : "";

    // Kanonik olarak Türkçe sürüm verilir, diğerleri alternatif
    return `  <url>
    <loc>${SITE_URL}${localized("tr", path)}</loc>${lastmod}
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${localized("tr", path)}"/>
  </url>`;
}

/** Dil öneki olmayan, içerikten bağımsız sayfalar */
const STATIC_PATHS = [
    "/",
    "/arac-kiralama",
    "/gunubirlik-turlar",
    "/konaklamali-turlar",
    "/bungalov-konaklama",
    "/hakkimizda",
    "/iletisim",
];

export async function GET() {
    let data = null;
    try {
        data = await getSitemapData();
    } catch {
        // Backend kapalıysa en azından sabit sayfalar yayınlanır
    }

    const entries = [
        ...STATIC_PATHS.map((path) => urlEntry(path)),
        ...(data?.vehicles ?? []).map((v) => urlEntry(`/arac-kiralama/${v.slug}`, v.lastModified)),
        ...(data?.dailyTours ?? []).map((t) => urlEntry(`/gunubirlik-turlar/${t.slug}`, t.lastModified)),
        ...(data?.cultureTours ?? []).map((t) => urlEntry(`/konaklamali-turlar/${t.slug}`, t.lastModified)),
        ...(data?.bungalows ?? []).map((b) => urlEntry(`/bungalov-konaklama/${b.slug}`, b.lastModified)),
        ...(data?.staticPages ?? []).map((p) => urlEntry(`/${p.slug}`, p.lastModified)),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}