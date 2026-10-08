import { notFound } from "next/navigation";
import TourForm from "@/components/admin/TourForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params, searchParams }) {
    const { id } = await params;
    const { kopya } = await searchParams;
    const isCopy = id === "yeni" && kopya;
    return {
        title: `${id === "yeni" ? (isCopy ? "Kültür Turu Kopyala" : "Yeni Kültür Turu") : "Kültür Turu Düzenle"} | Rentravel Yönetim`,
    };
}

export default async function CultureTourFormPage({ params, searchParams }) {
    const { id } = await params;
    const { kopya } = await searchParams;
    const isNew = id === "yeni";
    const isCopy = isNew && Boolean(kopya);

    const [categories, list, record] = await Promise.all([
        adminFetch("/admin/tour-categories", { fallback: [] }),
        isNew ? adminFetch("/admin/culture-tours", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew
            ? isCopy
                ? adminFetch(`/admin/culture-tours/${kopya}`)
                : Promise.resolve({ data: null })
            : adminFetch(`/admin/culture-tours/${id}`),
    ]);

    if (!isNew && !record.data) notFound();
    if (isCopy && !record.data) notFound();

    const usable = asList(categories.data).filter((c) => c.appliesTo === "Culture" || c.appliesTo === "Both");

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
        <TourForm
            variant="culture"
            record={initialRecord}
            isCopy={isCopy}
            categories={usable}
            nextOrder={isNew ? nextIndex(list.data) : 0}
        />
    );
}

/** { tr: "Kapadokya Turu", en: "Cappadocia Tour" } → { tr: "Kapadokya Turu (Kopya)", en: "Cappadocia Tour (Copy)" } */
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