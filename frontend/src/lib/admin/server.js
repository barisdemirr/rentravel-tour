import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, readToken } from "./session";

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5252";

/** Oturumu doğrular, yoksa login'e atar. Sunucu bileşenlerinde kullanılır. */
export async function requireSession() {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    const payload = readToken(token);
    if (!payload) redirect("/admin/login");
    return { token, payload };
}

/** Sunucu tarafında admin API çağrısı. Hata fırlatmaz, { data, error } döner. */
export async function adminFetch(path, { fallback = null } = {}) {
    const { token } = await requireSession();

    try {
        const response = await fetch(`${API}/api${path}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (response.status === 401) redirect("/admin/login");
        if (!response.ok) return { data: fallback, error: `HTTP ${response.status}` };

        return { data: await response.json(), error: null };
    } catch {
        return { data: fallback, error: "network" };
    }
}