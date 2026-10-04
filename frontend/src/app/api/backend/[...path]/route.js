import { cookies } from "next/headers";
import { ADMIN_COOKIE, readToken } from "@/lib/admin/session";

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5252";

// Panelden erişilebilecek yollar. Yeni bir uç eklersen buraya da ekle.
const ALLOWED = /^(admin\/|auth\/me$|sitemap$)/;

async function forward(request, context) {
    const { path = [] } = await context.params;
    const target = path.join("/");

    if (!ALLOWED.test(target)) {
        return Response.json({ title: "Bu uca erişilemez." }, { status: 403 });
    }

    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!readToken(token)) {
        return Response.json({ title: "Oturum süresi doldu." }, { status: 401 });
    }

    const url = new URL(request.url);
    const headers = new Headers({ Authorization: `Bearer ${token}` });

    // Dosya yüklemede (multipart) Content-Type sınırı (boundary) içerdiğinden olduğu gibi aktarılır
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("Content-Type", contentType);

    const hasBody = !["GET", "HEAD"].includes(request.method);

    let response;
    try {
        response = await fetch(`${API}/api/${target}${url.search}`, {
            method: request.method,
            headers,
            body: hasBody ? request.body : undefined,
            duplex: hasBody ? "half" : undefined, // gövdeyi akış olarak geçirmek için gerekli
            cache: "no-store",
        });
    } catch {
        return Response.json({ title: "Sunucuya ulaşılamadı." }, { status: 503 });
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