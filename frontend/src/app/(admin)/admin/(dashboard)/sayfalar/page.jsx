import StaticPagesClient from "./StaticPagesClient";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Statik Sayfalar | Rentravel Yönetim" };

export default async function StaticPagesPage() {
    const { data, error } = await adminFetch("/admin/static-pages", { fallback: [] });
    return <StaticPagesClient rows={asList(data)} failed={Boolean(error)} />;
}