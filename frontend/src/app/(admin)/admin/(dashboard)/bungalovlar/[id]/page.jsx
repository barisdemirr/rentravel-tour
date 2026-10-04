import { notFound } from "next/navigation";
import BungalowForm from "../BungalowForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return { title: `${id === "yeni" ? "Yeni Bungalov" : "Bungalov Düzenle"} | Rentravel Yönetim` };
}

export default async function BungalowFormPage({ params }) {
    const { id } = await params;
    const isNew = id === "yeni";

    const [regions, list, record] = await Promise.all([
        adminFetch("/admin/bungalow-regions", { fallback: [] }),
        isNew ? adminFetch("/admin/bungalows", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew ? Promise.resolve({ data: null }) : adminFetch(`/admin/bungalows/${id}`),
    ]);

    if (!isNew && !record.data) notFound();

    return (
        <BungalowForm
            record={record.data}
            regions={asList(regions.data)}
            nextOrder={isNew ? nextIndex(asList(list.data)) : 0}
        />
    );
}