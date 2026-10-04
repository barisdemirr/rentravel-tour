import "@/styles/globals.css";
import { notFound } from "next/navigation";
import { Providers } from "./providers";
import UserShell from "./UserShell";
import { SITE, SPLASH_STORAGE_KEY } from "@/lib/constants";
import { interpolate } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DIRECTIONS, LOCALES, OG_LOCALES, isLocale } from "@/lib/i18n/config";
import Analytics from "@/components/seo/Analytics";
import { SITE_URL } from "@/lib/siteUrl";
import { safe } from "@/lib/api";
import { getSiteSettings } from "@/services";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rentravel.com.tr";

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export function generateStaticParams() {
    return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const t = getDictionary(lang);
    const title = t.meta.title;
    const description = interpolate(t.meta.description, { tursabNo: SITE.tursabNo });

    return {
        metadataBase: new URL(SITE_URL),
        alternates: buildAlternates("/", lang),
        title: { default: title, template: "%s | Rentravel Turizm" },
        description,
        icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
        openGraph: {
            title,
            description,
            siteName: "Rentravel Turizm",
            images: [{ url: "/icon.png", width: 512, height: 512, alt: "Rentravel Turizm Logo" }],
            locale: OG_LOCALES[lang],
            type: "website",
        },
        twitter: { card: "summary_large_image", title, description, images: ["/icon.png"] },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    };
}

// Ölçümleme kodları ve site doğrulama etiketi panelden gelir
const settings = await safe(getSiteSettings(), null);

// Splash daha önce görüldüyse, sayfa boyanmadan önce işaretler (flaş olmasın)
const splashSeenScript = `try{if(sessionStorage.getItem("${SPLASH_STORAGE_KEY}")==="1")document.documentElement.setAttribute("data-splash-seen","1")}catch(e){}`;

export default async function LangLayout({ children, params }) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();

    return (
        <html lang={lang} dir={DIRECTIONS[lang]} suppressHydrationWarning>
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                    rel="stylesheet"
                />
                <script dangerouslySetInnerHTML={{ __html: splashSeenScript }} />
                {settings?.searchConsoleToken && (
                    <meta name="google-site-verification" content={settings.searchConsoleToken} />
                )}
            </head>
            <body>
                <Providers locale={lang}>
                    <UserShell>{children}</UserShell>
                </Providers>

                <Analytics settings={settings} />
            </body>
        </html>
    );
}