import ProfileClient from "./ProfileClient";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profilim | Rentravel Yönetim" };

export default async function ProfilePage() {
    const { data } = await adminFetch("/admin/me");
    return <ProfileClient me={data} />;
}