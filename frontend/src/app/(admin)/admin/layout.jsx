import { cookies } from "next/headers";
import { ADMIN_COOKIE, readToken } from "@/lib/admin/session";
import "@/styles/admin.css";

export const metadata = {
    title: "Yönetim Paneli | Rentravel",
    robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }) {
    // Login sayfası da bu layout'u kullanır, bu yüzden burada yönlendirme yok;
    // koruma middleware'de ve her sayfanın requireSession çağrısında.
    const payload = readToken((await cookies()).get(ADMIN_COOKIE)?.value);

    return (
        <div className="admin-root" data-signed-in={payload ? "1" : "0"}>
            {children}
        </div>
    );
}