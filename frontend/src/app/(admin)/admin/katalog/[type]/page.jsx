import { notFound } from "next/navigation";
import CatalogList from "@/components/admin/CatalogList";
import { adminFetch } from "@/lib/admin/server";
import { CATALOGS } from "@/lib/admin/catalogs";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { type } = await params;
    const catalog = CATALOGS[type];
    return { title: catalog ? `${catalog.title} | Rentravel Yönetim` : "Yönetim Paneli" };
}

export default async function CatalogListPage({ params }) {
    const { type } = await params;
    const catalog = CATALOGS[type];
    if (!catalog) notFound();

    const { data, error } = await adminFetch(`/admin/${catalog.api}`, { fallback: [] });
    const rows = Array.isArray(data) ? data : (data?.items ?? []);

    return <CatalogList slug={type} catalog={catalog} rows={rows} failed={Boolean(error)} />;
}