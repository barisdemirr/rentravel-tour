import { notFound } from "next/navigation";
import CatalogForm from "@/components/admin/CatalogForm";
import { adminFetch } from "@/lib/admin/server";
import { CATALOGS } from "@/lib/admin/catalogs";
import { nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { type, id } = await params;
    const catalog = CATALOGS[type];
    if (!catalog) return { title: "Yönetim Paneli" };
    return { title: `${id === "yeni" ? "Yeni" : "Düzenle"} · ${catalog.title} | Rentravel Yönetim` };
}

export default async function CatalogFormPage({ params }) {
    const { type, id } = await params;
    const catalog = CATALOGS[type];
    if (!catalog) notFound();

    // Listeden ilgili kaydı bul (tekil GET ucu olmayan kataloglar için güvenli yol)
    const { data } = await adminFetch(`/admin/${catalog.api}`, { fallback: [] });
    const rows = Array.isArray(data) ? data : (data?.items ?? []);

    // Yeni kayıt: listenin sonuna eklenir
    if (id === "yeni") {
        return <CatalogForm slug={type} catalog={catalog} record={null} nextOrder={nextIndex(rows)} />;
    }

    const record = rows.find((r) => r.id === id);
    if (!record) notFound();

    return <CatalogForm slug={type} catalog={catalog} record={record} />;
}