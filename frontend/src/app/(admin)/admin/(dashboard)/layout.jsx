import { requireSession } from "@/lib/admin/server";
import AdminShell from "./AdminShell";

export default async function DashboardLayout({ children }) {
    const { payload } = await requireSession();

    const user = {
        name: payload.name || payload.unique_name || payload.email || "Yönetici",
        email: payload.email || "",
    };

    return <AdminShell user={user}>{children}</AdminShell>;
}