import { notFound } from "next/navigation";
import VehicleForm from "../VehicleForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return { title: `${id === "yeni" ? "Yeni Araç" : "Araç Düzenle"} | Rentravel Yönetim` };
}

export default async function VehicleFormPage({ params }) {
    const { id } = await params;
    const isNew = id === "yeni";

    // Segment ve ekstra katalogları forma gerekli
    const [segments, extras, list, record] = await Promise.all([
        adminFetch("/admin/vehicle-segments", { fallback: [] }),
        adminFetch("/admin/vehicle-extras", { fallback: [] }),
        isNew ? adminFetch("/admin/vehicles", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew ? Promise.resolve({ data: null }) : adminFetch(`/admin/vehicles/${id}`),
    ]);

    if (!isNew && !record.data) notFound();

    return (
        <VehicleForm
            record={record.data}
            segments={asList(segments.data)}
            extras={asList(extras.data)}
            nextOrder={isNew ? nextIndex(list.data) : 0}
        />
    );
}