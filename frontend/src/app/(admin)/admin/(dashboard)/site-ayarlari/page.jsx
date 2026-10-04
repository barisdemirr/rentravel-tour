import SiteSettingsForm from "./SiteSettingsForm";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site Ayarları | Rentravel Yönetim" };

export default async function SiteSettingsPage() {
    const { data, error } = await adminFetch("/admin/site-settings", { fallback: {} });
    return <SiteSettingsForm settings={data ?? {}} failed={Boolean(error)} />;
}