import { notFound } from "next/navigation";
import { ApiError, settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { mediaUrl } from "@/lib/media";
import { buildAlternates } from "@/lib/seo";
import { getBungalowBySlug } from "@/services";
import BungalowDetailClient from "./BungalowDetailClient";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const pickDate = (value) => (typeof value === "string" && ISO.test(value) ? value : undefined);

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    if (!isLocale(lang)) return {};

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

export default async function BungalowDetailPage({ params, searchParams }) {
    const { slug } = await params;
    const sp = await searchParams;

    const bungalow = await settle(getBungalowBySlug(slug), null);

    if (bungalow.error instanceof ApiError && bungalow.error.status === 404) notFound();
    if (bungalow.error) throw bungalow.error; // başka hata: Next hata sayfası
    if (!bungalow.data) notFound();

    // Liste sayfasından gelen tarihler (?checkIn=2027-07-15&checkOut=2027-07-18)
    const initialDates = { checkIn: pickDate(sp?.checkIn), checkOut: pickDate(sp?.checkOut) };

    return <BungalowDetailClient bungalow={bungalow.data} initialDates={initialDates} />;
}