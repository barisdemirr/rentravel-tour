import { Suspense } from "react";
import { isKnownSlug, slugParams } from "@/lib/staticParams";
import { notFound } from "next/navigation";
import { ApiError } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { mediaUrl } from "@/lib/media";
import { buildAlternates } from "@/lib/seo";
import { getVehicleBySlug } from "@/services";
import VehicleDetailClient from "./VehicleDetailClient";
import VehicleDetailEntry from "./VehicleDetailEntry";

// Mevcut kayıtlar derlemede hazır HTML olarak üretilir, sonradan eklenenler ilk ziyarette üretilip
// önbelleğe alınır (ISR). Bu fonksiyon olmadan [slug] sayfaları her istekte yeniden render ediliyordu.
export function generateStaticParams() {
    return slugParams("vehicles");
}

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
    if (!isLocale(lang) || !(await isKnownSlug("vehicles", slug))) return {};

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

export default async function VehicleDetailPage({ params }) {
    const { slug } = await params;
    if (!(await isKnownSlug("vehicles", slug))) notFound();

    const vehicle = await loadVehicle(slug);
    if (!vehicle) notFound();

    // searchParams sunucuda okunmaz: sayfa statik (ISR) kalır, tarihleri VehicleDetailEntry tarayıcıda okur.
    // Suspense yedeği tarihsiz sürümdür; böylece HTML yine tam gelir.
    return (
        <Suspense fallback={<VehicleDetailClient vehicle={vehicle} initialDates={null} />}>
            <VehicleDetailEntry vehicle={vehicle} />
        </Suspense>
    );
}
