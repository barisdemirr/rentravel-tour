import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, readToken } from "./session";

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5252";

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
    const url = `${API}/api${path}`;

    let response;
    try {
        response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch (error) {
        // Sunucuya hiç ulaşılamadı: port kapalı, yanlış adres, sertifika sorunu
        console.error("[adminFetch] bağlantı hatası:", url, error?.cause?.code || error?.message);
        return { data: fallback, error: "network" };
    }

    // redirect() hata fırlatarak çalışır, bu yüzden try/catch DIŞINDA olmalı
    if (response.status === 401) redirect("/admin/login?expired=1");

    if (!response.ok) {
        const detail = await response.text().catch(() => "");
        console.error("[adminFetch]", response.status, url, detail.slice(0, 300));
        return { data: fallback, error: `HTTP ${response.status}` };
    }

    try {
        return { data: await response.json(), error: null };
    } catch {
        console.error("[adminFetch] yanıt JSON değil:", url);
        return { data: fallback, error: "parse" };
    }
}