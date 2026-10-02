import "@/styles/globals.css"
import { Providers } from "./providers";

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export const metadata = {
    title: "Rentravel Turizm | Premium Rotalar ve VIP Transfer",
    description:
        "TÜRSAB A Grubu 15869 lisanslı Rentravel ile Karadeniz, Kapadokya, Batum turları, yayla konaklamaları ve VIP şoförlü lüks transfer hizmetleri.",
    icons: { icon: "/icon.png", shortcut: "/icon.png", apple: "/icon.png" },
    openGraph: {
        title: "Rentravel Turizm | Premium Rotalar ve VIP Transfer",
        description:
            "TÜRSAB A Grubu 15869 lisanslı Rentravel ile Karadeniz, Kapadokya, Batum turları, yayla konaklamaları ve VIP şoförlü lüks transfer hizmetleri.",
        url: "https://rentravel.com.tr",
        siteName: "Rentravel Turizm",
        images: [{ url: "/icon.png", width: 512, height: 512, alt: "Rentravel Turizm Logo" }],
        locale: "tr_TR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Rentravel Turizm | Premium Rotalar ve VIP Transfer",
        description:
            "TÜRSAB A Grubu 15869 lisanslı Rentravel ile Karadeniz, Kapadokya, Batum turları, yayla konaklamaları ve VIP şoförlü lüks transfer hizmetleri.",
        images: ["/icon.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="tr">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}