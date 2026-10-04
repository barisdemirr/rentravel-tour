import { SITE_URL } from "@/lib/siteUrl";
import { getSiteSettings } from "@/services";

export const revalidate = 3600;

const DEFAULT = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${SITE_URL}/sitemap.xml`;

export async function GET() {
    let content = DEFAULT;

    try {
        const settings = await getSiteSettings();
        // Panelden özel içerik girildiyse o kullanılır
        if (settings?.robotsTxtContent?.trim()) content = settings.robotsTxtContent.trim();
    } catch {
        // Backend kapalıysa varsayılan yayınlanır
    }

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}