import { notFound } from "next/navigation";
import AccommodationPricesClient from "./AccommodationPricesClient";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Konaklama Fiyatları | Rentravel Yönetim" };

export default async function AccommodationPricesPage({ params }) {
    const { id } = await params;

    const [tour, prices, types] = await Promise.all([
        adminFetch(`/admin/culture-tours/${id}`),
        adminFetch(`/admin/culture-tours/${id}/accommodation-prices`, { fallback: [] }),
        adminFetch("/admin/accommodation-types", { fallback: [] }),
    ]);

    if (!tour.data) notFound();

    return (
        <AccommodationPricesClient
            tour={tour.data}
            prices={asList(prices.data)}
            types={asList(types.data)}
        />
    );
}