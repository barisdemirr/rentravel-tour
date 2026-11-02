import "@/styles/globals.css";
import { notFound } from "next/navigation";
import { Providers } from "./providers";
import UserShell from "./UserShell";
import { SITE, SPLASH_STORAGE_KEY } from "@/lib/constants";
import { interpolate } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { DIRECTIONS, LOCALES, OG_LOCALES, isLocale } from "@/lib/i18n/config";
import Analytics from "@/components/seo/Analytics";
import StructuredData from "@/components/seo/StructuredData";
import { SITE_URL } from "@/lib/siteUrl";
import { safe } from "@/lib/api";
import { getSiteSettings } from "@/services/siteSettings";
import { getStaticPages } from "@/services/staticPages";
import { buildAlternates } from "@/lib/seo";

export const viewport = {
    width: "device-width",
    initialScale: 1,
    // maximumScale kaldırıldı: yakınlaştırmayı engellemek erişilebilirlik hatası
    themeColor: "#d90429",
};

// Güvenlik ağı: backend (paylaşımlı hosting) kilitlenirse bir istek en fazla 20 sn sürer.
// Vercel bellek ücretini istek açık kaldığı sürece yazar; varsayılan sınır 300 sn idi.
export const maxDuration = 20;

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
        keywords: t.meta.keywords,
        applicationName: "Rentravel Turizm",
        authors: [{ name: "Rentravel Turizm" }],
        creator: "Rentravel Turizm",
        publisher: "Rentravel Turizm",
        category: "travel",
        // Telefon numaralarını tarayıcı kendi başına bağlantıya çevirmesin
        formatDetection: { telephone: false, address: false, email: false },
        // Tek kare logo: sekme ikonu, Android ve iOS ana ekranı
        icons: {
            icon: [{ url: "/logo.png", sizes: "512x512", type: "image/png" }],
            shortcut: "/logo.png",
            apple: [{ url: "/logo.png", sizes: "512x512", type: "image/png" }],
        },
        openGraph: {
            title,
            description,
            siteName: "Rentravel Turizm",
            url: `${SITE_URL}${lang === "tr" ? "" : `/${lang}`}`,
            images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rentravel Turizm" }],
            locale: OG_LOCALES[lang],
            type: "website",
        },
        twitter: {
            // Kare görselle geniş kart kırpılır, summary doğru olanı
            card: "summary",
            title,
            description,
            images: ["/logo.png"],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    };
}

// Splash daha önce görüldüyse, sayfa boyanmadan önce işaretler (flaş olmasın)
const splashSeenScript = `try{if(sessionStorage.getItem("${SPLASH_STORAGE_KEY}")==="1")document.documentElement.setAttribute("data-splash-seen","1")}catch(e){}`;

export default async function LangLayout({ children, params }) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();

    // Ölçümleme kodları, doğrulama etiketi ve alt menü bağlantıları panelden gelir.
    // İstek içinde çekilir: panelde yapılan değişiklik yeniden başlatmadan yansısın.
    const [settings, pages] = await Promise.all([
        safe(getSiteSettings(), null),
        safe(getStaticPages(), []),
    ]);

    return (
        <html lang={lang} dir={DIRECTIONS[lang]} suppressHydrationWarning>
            <head>
                {/* Font sunucusuna erken bağlan: ikonlar daha hızlı gelsin */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
                    <UserShell pages={pages}>{children}</UserShell>
                </Providers>

                <StructuredData locale={lang} />
                <Analytics settings={settings} />
            </body>
        </html>
    );
}