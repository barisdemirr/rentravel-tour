import { notFound } from "next/navigation";
import { isKnownSlug, slugParams } from "@/lib/staticParams";
import { ApiError, settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { mediaUrl } from "@/lib/media";
import { buildAlternates } from "@/lib/seo";
import { getDailyTourBySlug, getDailyTourSessions } from "@/services";
import DailyTourDetailClient from "./DailyTourDetailClient";

// Mevcut kayıtlar derlemede hazır HTML olarak üretilir, sonradan eklenenler ilk ziyarette üretilip
// önbelleğe alınır (ISR). Bu fonksiyon olmadan [slug] sayfaları her istekte yeniden render ediliyordu.
export function generateStaticParams() {
    return slugParams("dailyTours");
}

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    if (!isLocale(lang) || !(await isKnownSlug("dailyTours", slug))) return {};

    const { data: tour } = await settle(getDailyTourBySlug(slug), null);
    if (!tour) return {};

    const title = localized(tour.seoTitle, lang) || localized(tour.title, lang);
    const description = localized(tour.seoDescription, lang) || localized(tour.description, lang);
    const cover = tour.ogImage || tour.image;

    return {
        title,
        description,
        alternates: buildAlternates(`/gunubirlik-turlar/${slug}`, lang),
        openGraph: {
            title,
            description,
            images: cover ? [{ url: mediaUrl(cover) }] : undefined,
        },
    };
}

export default async function DailyTourDetailPage({ params }) {
    const { slug } = await params;
    if (!(await isKnownSlug("dailyTours", slug))) notFound();

    const [tour, sessions] = await Promise.all([
        settle(getDailyTourBySlug(slug), null),
        settle(getDailyTourSessions(slug), []),
    ]);

    if (tour.error instanceof ApiError && tour.error.status === 404) notFound();
    if (tour.error) throw tour.error; // başka hata: Next hata sayfası
    if (!tour.data) notFound();

    return <DailyTourDetailClient tour={tour.data} sessions={sessions.data} />;
}