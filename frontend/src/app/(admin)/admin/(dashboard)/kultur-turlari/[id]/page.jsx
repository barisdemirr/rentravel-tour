import { notFound } from "next/navigation";
import TourForm from "@/components/admin/TourForm";
import { adminFetch } from "@/lib/admin/server";
import { nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return { title: `${id === "yeni" ? "Yeni Kültür Turu" : "Kültür Turu Düzenle"} | Rentravel Yönetim` };
}

export default async function CultureTourFormPage({ params }) {
    const { id } = await params;
    const isNew = id === "yeni";

    const [categories, list, record] = await Promise.all([
        adminFetch("/admin/tour-categories", { fallback: [] }),
        isNew ? adminFetch("/admin/culture-tours", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew ? Promise.resolve({ data: null }) : adminFetch(`/admin/culture-tours/${id}`),
    ]);

    if (!isNew && !record.data) notFound();

    const usable = (categories.data ?? []).filter((c) => c.appliesTo === "Culture" || c.appliesTo === "Both");

    return (
        <TourForm
            variant="culture"
            record={record.data}
            categories={usable}
            nextOrder={isNew ? nextIndex(list.data ?? []) : 0}
        />
    );
}