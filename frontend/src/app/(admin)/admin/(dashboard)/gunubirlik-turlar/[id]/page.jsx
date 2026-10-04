import { notFound } from "next/navigation";
import TourForm from "@/components/admin/TourForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return { title: `${id === "yeni" ? "Yeni Tur" : "Tur Düzenle"} | Rentravel Yönetim` };
}

export default async function DailyTourFormPage({ params }) {
    const { id } = await params;
    const isNew = id === "yeni";

    const [categories, list, record] = await Promise.all([
        adminFetch("/admin/tour-categories", { fallback: [] }),
        isNew ? adminFetch("/admin/daily-tours", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew ? Promise.resolve({ data: null }) : adminFetch(`/admin/daily-tours/${id}`),
    ]);

    if (!isNew && !record.data) notFound();

    // Kategoriler kullanım alanına göre süzülür
    const usable = asList(categories.data).filter((c) => c.appliesTo === "Daily" || c.appliesTo === "Both");

    return (
        <TourForm
            variant="daily"
            record={record.data}
            categories={usable}
            nextOrder={isNew ? nextIndex(list.data) : 0}
        />
    );
}