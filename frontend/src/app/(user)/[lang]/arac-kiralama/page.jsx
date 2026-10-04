import { settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buildAlternates } from "@/lib/seo";
import { getVehicleSegments, getVehicles } from "@/services";
import CarRentalClient from "./CarRentalClient";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const { meta } = getDictionary(lang).carRental;

    return {
        title: meta.title,
        description: meta.description,
        alternates: buildAlternates("/arac-kiralama", lang),
        openGraph: { title: meta.title, description: meta.description },
    };
}

export default async function CarRentalPage() {
    const [segments, vehicles] = await Promise.all([
        settle(getVehicleSegments()),
        settle(getVehicles()),
    ]);

    return (
        <CarRentalClient
            segments={segments.data}
            vehicles={vehicles.data}
            hasError={segments.error || vehicles.error}
        />
    );
}