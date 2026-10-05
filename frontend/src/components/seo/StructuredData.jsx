import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Google'a firmayı tanıtan yapısal veri. Yerel aramada ve bilgi kartında kullanılır.
 * Adres ve koordinatlar doğru olmalı, uydurma bilgi Google tarafından cezalandırılır.
 */
export default function StructuredData({ locale }) {
    const data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["TravelAgency", "LocalBusiness"],
                "@id": `${SITE_URL}/#organization`,
                name: "Rentravel Turizm",
                alternateName: "Rentravel Agency",
                url: SITE_URL,
                logo: `${SITE_URL}/icon.png`,
                image: `${SITE_URL}/og-image.jpg`,
                telephone: SITE.phone,
                ...(SITE.email ? { email: SITE.email } : {}),
                priceRange: "₺₺",
                currenciesAccepted: "TRY",
                address: {
                    "@type": "PostalAddress",
                    streetAddress: SITE.address,
                    addressLocality: "Trabzon",
                    addressRegion: "Trabzon",
                    addressCountry: "TR",
                },
                areaServed: [
                    { "@type": "City", name: "Trabzon" },
                    { "@type": "City", name: "Rize" },
                    { "@type": "City", name: "Artvin" },
                    { "@type": "AdministrativeArea", name: "Doğu Karadeniz" },
                ],
                knowsLanguage: ["tr", "en", "ar"],
                sameAs: [SITE.instagram, SITE.facebook].filter(Boolean),
                makesOffer: [
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Araç kiralama" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Günübirlik tur" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Konaklamalı kültür turu" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Bungalov konaklama" } },
                    { "@type": "Offer", itemOffered: { "@type": "Service", name: "Havalimanı transferi" } },
                ],
            },
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: "Rentravel Turizm",
                publisher: { "@id": `${SITE_URL}/#organization` },
                inLanguage: locale,
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}