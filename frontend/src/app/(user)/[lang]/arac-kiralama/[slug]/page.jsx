import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { mediaUrl } from "@/lib/media";
import { buildAlternates } from "@/lib/seo";
import { getVehicleBySlug } from "@/services";
import VehicleDetailClient from "./VehicleDetailClient";

// 404 ise null, diğer hatalar fırlatılır (aynı istek önbellekten gelir)
async function loadVehicle(slug) {
    try {
        return await getVehicleBySlug(slug);
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    if (!isLocale(lang)) return {};

    const vehicle = await loadVehicle(slug);
    if (!vehicle) return {};

    const title = localized(vehicle.seoTitle, lang) || localized(vehicle.name, lang);
    const description = localized(vehicle.seoDescription, lang) || localized(vehicle.tagline, lang);
    const image = mediaUrl(vehicle.ogImage ?? vehicle.image);

    return {
        title,
        description,
        alternates: buildAlternates(`/arac-kiralama/${slug}`, lang),
        openGraph: { title, description, ...(image && { images: [{ url: image }] }) },
    };
}

// Listeden gelen tarihler: ?pickupDate=2027-07-15&pickupTime=10:00&returnDate=2027-07-18&returnTime=10:00
function parseDates(search) {
    const date = /^\d{4}-\d{2}-\d{2}$/;
    const time = /^\d{2}:\d{2}$/;
    const { pickupDate, pickupTime, returnDate, returnTime } = search;

    if (!date.test(pickupDate ?? "") || !date.test(returnDate ?? "")) return null;

    return {
        pickupDate,
        returnDate,
        pickupTime: time.test(pickupTime ?? "") ? pickupTime : "10:00",
        returnTime: time.test(returnTime ?? "") ? returnTime : "10:00",
    };
}

export default async function VehicleDetailPage({ params, searchParams }) {
    const { slug } = await params;
    const vehicle = await loadVehicle(slug);
    if (!vehicle) notFound();

    return <VehicleDetailClient vehicle={vehicle} initialDates={parseDates(await searchParams)} />;
}