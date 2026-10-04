import UsersClient from "./UsersClient";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yöneticiler | Rentravel Yönetim" };

export default async function UsersPage() {
    const [users, me] = await Promise.all([
        adminFetch("/admin/users", { fallback: [] }),
        adminFetch("/admin/me"),
    ]);

    return <UsersClient rows={asList(users.data)} meId={me.data?.id ?? null} failed={Boolean(users.error)} />;
}