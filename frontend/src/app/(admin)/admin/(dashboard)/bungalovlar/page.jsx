import BungalowList from "./BungalowList";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bungalovlar | Rentravel Yönetim" };

export default async function BungalowsPage() {
    const { data, error } = await adminFetch("/admin/bungalows", { fallback: [] });
    return <BungalowList rows={asList(data)} failed={Boolean(error)} />;
}