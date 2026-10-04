import { notFound } from "next/navigation";
import StaticPageForm from "../StaticPageForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return { title: `${id === "yeni" ? "Yeni Sayfa" : "Sayfa Düzenle"} | Rentravel Yönetim` };
}

export default async function StaticPageFormPage({ params }) {
    const { id } = await params;
    const isNew = id === "yeni";

    const [list, record] = await Promise.all([
        isNew ? adminFetch("/admin/static-pages", { fallback: [] }) : Promise.resolve({ data: [] }),
        isNew ? Promise.resolve({ data: null }) : adminFetch(`/admin/static-pages/${id}`),
    ]);

    if (!isNew && !record.data) notFound();

    return <StaticPageForm record={record.data} nextOrder={isNew ? nextIndex(asList(list.data)) : 0} />;
}