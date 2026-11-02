import { notFound } from "next/navigation";
import { isKnownSlug, slugParams } from "@/lib/staticParams";
import { ApiError, settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { mediaUrl } from "@/lib/media";
import { buildAlternates } from "@/lib/seo";
import { getCultureTourAccommodationOptions, getCultureTourBySlug, getCultureTourSessions } from "@/services";
import CultureTourDetailClient from "./CultureTourDetailClient";

// Mevcut kayıtlar derlemede hazır HTML olarak üretilir, sonradan eklenenler ilk ziyarette üretilip
// önbelleğe alınır (ISR). Bu fonksiyon olmadan [slug] sayfaları her istekte yeniden render ediliyordu.
export function generateStaticParams() {
    return slugParams("cultureTours");
}

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    if (!isLocale(lang) || !(await isKnownSlug("cultureTours", slug))) return {};

    const { data: tour } = await settle(getCultureTourBySlug(slug), null);
    if (!tour) return {};

    const title = localized(tour.seoTitle, lang) || localized(tour.title, lang);
    const description = localized(tour.seoDescription, lang) || localized(tour.description, lang);
    const cover = tour.ogImage || tour.image;

    return {
        title,
        description,
        alternates: buildAlternates(`/konaklamali-turlar/${slug}`, lang),
        openGraph: {
            title,
            description,
            images: cover ? [{ url: mediaUrl(cover) }] : undefined,
        },
    };
}

export default async function CultureTourDetailPage({ params }) {
    const { slug } = await params;
    if (!(await isKnownSlug("cultureTours", slug))) notFound();

    const [tour, sessions, options] = await Promise.all([
        settle(getCultureTourBySlug(slug), null),
        settle(getCultureTourSessions(slug), []),
        settle(getCultureTourAccommodationOptions(slug), []),
    ]);

    if (tour.error instanceof ApiError && tour.error.status === 404) notFound();
    if (tour.error) throw tour.error; // başka hata: Next hata sayfası
    if (!tour.data) notFound();

    return <CultureTourDetailClient tour={tour.data} sessions={sessions.data} options={options.data} />;
}