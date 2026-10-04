import TourList from "@/components/admin/TourList";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kültür Turları | Rentravel Yönetim" };

export default async function CultureToursPage() {
    const { data, error } = await adminFetch("/admin/culture-tours", { fallback: [] });
    const rows = Array.isArray(data) ? data : (data?.items ?? []);

    return <TourList variant="culture" rows={rows} failed={Boolean(error)} />;
}