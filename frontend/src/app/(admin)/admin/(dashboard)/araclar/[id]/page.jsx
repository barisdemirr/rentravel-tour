import { notFound } from "next/navigation";
import VehicleForm from "../VehicleForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
    const { id } = await params;
    const { kopya } = await searchParams;
    const isCopy = id === "yeni" && kopya;
    return {
        title: `${id === "yeni" ? (isCopy ? "Araç Kopyala" : "Yeni Araç") : "Araç Düzenle"} | Rentravel Yönetim`,
    };
}

export default async function VehicleFormPage({ params, searchParams }) {
    const { id } = await params;
    const { kopya } = await searchParams;
    const isNew = id === "yeni";
    const isCopy = isNew && Boolean(kopya);

    // Segment ve ekstra katalogları forma gerekli
    const [segments, extras, list, record] = await Promise.all([
        adminFetch("/admin/vehicle-segments", { fallback: [] }),
        adminFetch("/admin/vehicle-extras", { fallback: [] }),
        isNew ? adminFetch("/admin/vehicles", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew
            ? isCopy
                ? adminFetch(`/admin/vehicles/${kopya}`)
                : Promise.resolve({ data: null })
            : adminFetch(`/admin/vehicles/${id}`),
    ]);

    if (!isNew && !record.data) notFound();
    if (isCopy && !record.data) notFound();

    // Kopya modunda: kaydın id'sini düşür, yayından çıkar, öne çıkarmayı kapat, ada "(Kopya)" ekle
    let initialRecord = record.data;
    if (isCopy && initialRecord) {
        initialRecord = {
            ...initialRecord,
            id: undefined,
            isActive: false,
            isFeatured: false,
            name: appendCopySuffix(initialRecord.name),
        };
    }

    return (
        <VehicleForm
            record={initialRecord}
            isCopy={isCopy}
            segments={asList(segments.data)}
            extras={asList(extras.data)}
            nextOrder={isNew ? nextIndex(list.data) : 0}
        />
    );
}

/** { tr: "Mercedes Vito", en: "Mercedes Vito" } → { tr: "Mercedes Vito (Kopya)", en: "Mercedes Vito (Copy)" } */
function appendCopySuffix(name) {
    if (!name || typeof name !== "object") return name;
    const suffix = { tr: " (Kopya)", en: " (Copy)", ar: " (نسخة)" };
    const out = {};
    for (const key of Object.keys(name)) {
        const value = name[key];
        out[key] = value ? `${value}${suffix[key] ?? suffix.en}` : value;
    }
    return out;
}