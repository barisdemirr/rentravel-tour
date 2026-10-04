import VehicleList from "./VehicleList";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Araçlar | Rentravel Yönetim" };

export default async function VehiclesPage() {
    const { data, error } = await adminFetch("/admin/vehicles", { fallback: [] });
    const rows = Array.isArray(data) ? data : (data?.items ?? []);

    return <VehicleList rows={rows} failed={Boolean(error)} />;
}