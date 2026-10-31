import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { PUBLIC_TAGS } from "@/lib/api/cache";
import { ADMIN_COOKIE, readToken } from "@/lib/admin/session";

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5252";

// Panelden erişilebilecek yollar. Yeni bir uç eklersen buraya da ekle.
const ALLOWED = /^(admin\/|auth\/me$|sitemap$)/;

/** Oturum çerezini siler: ayar, oluşturulduğu yolla aynı olmalı */
async function clearSession() {
    (await cookies()).set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
}

async function forward(request, context) {
    const { path = [] } = await context.params;
    const target = path.join("/");

    if (!ALLOWED.test(target)) {
        return Response.json({ title: "Bu uca erişilemez." }, { status: 403 });
    }

    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!readToken(token)) {
        await clearSession();
        return Response.json({ title: "Oturum süresi doldu." }, { status: 401 });
    }

    const url = new URL(request.url);
    const headers = new Headers({ Authorization: `Bearer ${token}` });

    // Dosya yüklemede (multipart) Content-Type sınırı (boundary) içerdiğinden olduğu gibi aktarılır
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const hasBody = !["GET", "HEAD"].includes(request.method);

    // Gövde tamponlanır: akış olarak geçirmek bazı Node sürümlerinde isteği kesiyor.
    // Dosya yüklemede de sorun değil, sınır 10 MB.
    const body = hasBody ? await request.arrayBuffer() : undefined;

    let response;
    try {
        response = await fetch(`${API}/api/${target}${url.search}`, {
            method: request.method,
            headers,
            body: body && body.byteLength > 0 ? body : undefined,
            cache: "no-store",
        });
    } catch (error) {
        console.error("[proxy] bağlantı hatası:", target, error?.cause?.code || error?.message);
        return Response.json({ title: "Sunucuya ulaşılamadı." }, { status: 503 });
    }

    // Backend token'ı reddetti (imza geçersiz, anahtar değişmiş): çerez temizlenir,
    // bir sonraki sayfa geçişinde middleware login'e yönlendirir
    if (response.status === 401) {
        await clearSession();
    }

    // Hata durumunda sebebi günlüğe yaz
    if (!response.ok) {
        const clone = response.clone();
        const detail = await clone.text().catch(() => "");
        console.error("[proxy]", response.status, request.method, target, detail.slice(0, 400));
    }

    // Panelden başarılı bir değişiklik yapıldı: herkese açık sayfaların önbelleği süre dolmasını beklemeden tazelenir.
    // Böylece önbellek süresi uzun tutulabilir (sayfalar sürekli yeniden üretilmez, CPU harcanmaz)
    // ama panelde kaydedilen şey sitede hemen görünür.
    if (response.ok && !["GET", "HEAD"].includes(request.method) && target.startsWith("admin/")) {
        for (const tag of PUBLIC_TAGS) revalidateTag(tag);
    }

    const outHeaders = new Headers();
    const outType = response.headers.get("content-type");
    if (outType) outHeaders.set("Content-Type", outType);

    return new Response(response.body, { status: response.status, headers: outHeaders });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;