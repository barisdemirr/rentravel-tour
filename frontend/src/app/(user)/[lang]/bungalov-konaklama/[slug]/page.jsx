import { Suspense } from "react";
import { isKnownSlug, slugParams } from "@/lib/staticParams";
import { notFound } from "next/navigation";
import { ApiError, settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { mediaUrl } from "@/lib/media";
import { buildAlternates } from "@/lib/seo";
import { getBungalowBySlug } from "@/services";
import BungalowDetailClient from "./BungalowDetailClient";
import BungalowDetailEntry from "./BungalowDetailEntry";

// Mevcut kayıtlar derlemede hazır HTML olarak üretilir, sonradan eklenenler ilk ziyarette üretilip
// önbelleğe alınır (ISR). Bu fonksiyon olmadan [slug] sayfaları her istekte yeniden render ediliyordu.
export function generateStaticParams() {
    return slugParams("bungalows");
}

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    if (!isLocale(lang) || !(await isKnownSlug("bungalows", slug))) return {};

    const { data: bungalow } = await settle(getBungalowBySlug(slug), null);
    if (!bungalow) return {};

    const title = localized(bungalow.seoTitle, lang) || localized(bungalow.title, lang);
    const description = localized(bungalow.seoDescription, lang) || localized(bungalow.description, lang);
    const cover = bungalow.ogImage || bungalow.image;

    return {
        title,
        description,
        alternates: buildAlternates(`/bungalov-konaklama/${slug}`, lang),
        openGraph: {
            title,
            description,
            images: cover ? [{ url: mediaUrl(cover) }] : undefined,
        },
    };
}

export default async function BungalowDetailPage({ params }) {
    const { slug } = await params;
    if (!(await isKnownSlug("bungalows", slug))) notFound();

    const bungalow = await settle(getBungalowBySlug(slug), null);

    if (bungalow.error instanceof ApiError && bungalow.error.status === 404) notFound();
    if (bungalow.error) throw bungalow.error; // başka hata: Next hata sayfası
    if (!bungalow.data) notFound();

    // searchParams sunucuda okunmaz: sayfa statik (ISR) kalır, tarihleri BungalowDetailEntry tarayıcıda okur.
    return (
        <Suspense fallback={<BungalowDetailClient bungalow={bungalow.data} initialDates={{}} />}>
            <BungalowDetailEntry bungalow={bungalow.data} />
        </Suspense>
    );
}
