import TourList from "@/components/admin/TourList";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Günübirlik Turlar | Rentravel Yönetim" };

export default async function DailyToursPage() {
    const { data, error } = await adminFetch("/admin/daily-tours", { fallback: [] });
    const rows = Array.isArray(data) ? data : (data?.items ?? []);

    return <TourList variant="daily" rows={rows} failed={Boolean(error)} />;
}