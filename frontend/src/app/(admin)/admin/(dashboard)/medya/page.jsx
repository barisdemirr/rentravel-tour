import MediaClient from "./MediaClient";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Medya | Rentravel Yönetim" };

export default async function MediaPage() {
    const { data, error } = await adminFetch("/admin/media", { fallback: [] });
    return <MediaClient assets={asList(data)} failed={Boolean(error)} />;
}