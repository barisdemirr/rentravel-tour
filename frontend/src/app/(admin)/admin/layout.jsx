import { cookies } from "next/headers";
import { ADMIN_COOKIE, readToken } from "@/lib/admin/session";
import "@/styles/admin.css";

export const metadata = {
    title: "Yönetim Paneli | Rentravel",
    robots: { index: false, follow: false },
};

export default async function AdminRootLayout({ children }) {
    const payload = readToken((await cookies()).get(ADMIN_COOKIE)?.value);

    return (
        <html lang="tr">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
                    rel="stylesheet"
                />
            </head>
            <body>
                <div className="admin-root" data-signed-in={payload ? "1" : "0"}>
                    {children}
                </div>
            </body>
        </html>
    );
}