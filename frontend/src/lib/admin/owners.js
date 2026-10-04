import "server-only";
import { adminFetch } from "./server";
import { asList } from "./reorder";

/** Fiyatlama sayfaları için ürün listeleri. kinds: hangi türler gerekiyor */
export async function loadOwners(kinds = ["Vehicle", "DailyTour", "CultureTour", "Bungalow"]) {
    const map = {
        Vehicle: { api: "/admin/vehicles", label: "Araçlar", icon: "directions_car", nameKey: "name" },
        DailyTour: { api: "/admin/daily-tours", label: "Günübirlik Turlar", icon: "hiking", nameKey: "title" },
        CultureTour: { api: "/admin/culture-tours", label: "Kültür Turları", icon: "castle", nameKey: "title" },
        Bungalow: { api: "/admin/bungalows", label: "Bungalovlar", icon: "cottage", nameKey: "title" },
    };

    const results = await Promise.all(kinds.map((k) => adminFetch(map[k].api, { fallback: [] })));

    return kinds.map((kind, i) => {
        const config = map[kind];
        return {
            value: kind,
            label: config.label,
            icon: config.icon,
            items: asList(results[i].data).map((row) => ({
                id: row.id,
                label: `${row[config.nameKey]?.tr ?? row.slug}${row.isActive === false ? " (pasif)" : ""}`,
                currency: row.currency,
            })),
        };
    });
}