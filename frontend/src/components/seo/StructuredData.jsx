import { SITE } from "@/lib/constants";
import { SITE_URL } from "@/lib/siteUrl";

/**
 * Google'a firmayı tanıtan yapısal veri. Yerel aramada ve bilgi kartında kullanılır.
 * Adres ve TÜRSAB numarası doğru olmalı, uydurma bilgi Google tarafından cezalandırılır.
 */
export default function StructuredData({ locale }) {
    const logo = `${SITE_URL}/logo.png`;

    const data = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": ["TravelAgency", "LocalBusiness"],
                "@id": `${SITE_URL}/#organization`,
                name: "Rentravel Turizm",
                alternateName: "Rentravel Agency",
                url: SITE_URL,
                logo: {
                    "@type": "ImageObject",
                    url: logo,
                    width: 512,
                    height: 512,
                },
                image: logo,
                telephone: SITE.phone,
                ...(SITE.email ? { email: SITE.email } : {}),
                priceRange: "₺₺",
                currenciesAccepted: "TRY",
                // TÜRSAB belgesi: resmi yetki kaydı
                ...(SITE.tursabNo
                    ? {
                        hasCredential: {
                            "@type": "EducationalOccupationalCredential",
                            credentialCategory: "TÜRSAB A Grubu Seyahat Acentesi Belgesi",
                            identifier: SITE.tursabNo,
                            recognizedBy: {
                                "@type": "Organization",
                                name: "TÜRSAB",
                                url: "https://www.tursab.org.tr",
                            },
                        },
                    }
                    : {}),
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
                sameAs: [SITE.instagram, SITE.facebook, SITE.youtube, SITE.tiktok].filter(Boolean),
                makesOffer: [
                    "Araç kiralama",
                    "Günübirlik tur",
                    "Konaklamalı kültür turu",
                    "Bungalov konaklama",
                    "Havalimanı transferi",
                    "VIP transfer",
                ].map((name) => ({
                    "@type": "Offer",
                    itemOffered: { "@type": "Service", name, provider: { "@id": `${SITE_URL}/#organization` } },
                })),
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