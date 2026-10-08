import { notFound } from "next/navigation";
import BungalowForm from "../BungalowForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
    const { id } = await params;
    const { kopya } = await searchParams;
    const isCopy = id === "yeni" && kopya;
    return {
        title: `${id === "yeni" ? (isCopy ? "Bungalov Kopyala" : "Yeni Bungalov") : "Bungalov Düzenle"} | Rentravel Yönetim`,
    };
}

export default async function BungalowFormPage({ params, searchParams }) {
    const { id } = await params;
    const { kopya } = await searchParams;
    const isNew = id === "yeni";
    const isCopy = isNew && Boolean(kopya);

    const [regions, extras, list, record] = await Promise.all([
        adminFetch("/admin/bungalow-regions", { fallback: [] }),
        adminFetch("/admin/bungalow-extras", { fallback: [] }),
        isNew ? adminFetch("/admin/bungalows", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew
            ? isCopy
                ? adminFetch(`/admin/bungalows/${kopya}`)
                : Promise.resolve({ data: null })
            : adminFetch(`/admin/bungalows/${id}`),
    ]);

    if (!isNew && !record.data) notFound();
    if (isCopy && !record.data) notFound();

    // Kopya modunda: id'yi düşür, yayından çıkar, öne çıkarmayı kapat, ada "(Kopya)" ekle
    let initialRecord = record.data;
    if (isCopy && initialRecord) {
        initialRecord = {
            ...initialRecord,
            id: undefined,
            isActive: false,
            isFeatured: false,
            title: appendCopySuffix(initialRecord.title),
        };
    }

    return (
        <BungalowForm
            record={initialRecord}
            isCopy={isCopy}
            regions={asList(regions.data)}
            extras={asList(extras.data)} 
            nextOrder={isNew ? nextIndex(asList(list.data)) : 0}
        />
    );
}

/** { tr: "Yeşil Vadi", en: "Green Valley" } → { tr: "Yeşil Vadi (Kopya)", en: "Green Valley (Copy)" } */
function appendCopySuffix(title) {
    if (!title || typeof title !== "object") return title;
    const suffix = { tr: " (Kopya)", en: " (Copy)", ar: " (نسخة)" };
    const out = {};
    for (const key of Object.keys(title)) {
        const value = title[key];
        out[key] = value ? `${value}${suffix[key] ?? suffix.en}` : value;
    }
    return out;
}