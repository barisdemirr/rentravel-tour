import { cookies } from "next/headers";
import { ADMIN_COOKIE, cookieOptions, readToken } from "@/lib/admin/session";

export const maxDuration = 20;

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5252";

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return Response.json({ title: "Geçersiz istek." }, { status: 400 });
    }

    let response;
    try {
        response = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: body?.email ?? "", password: body?.password ?? "" }),
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
        });
    } catch {
        return Response.json({ title: "Sunucuya ulaşılamadı." }, { status: 503 });
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        // Backend'in problem+json gövdesini olduğu gibi geçiriyoruz (doğrulama hataları dahil)
        return Response.json(data ?? { title: "Giriş yapılamadı." }, { status: response.status });
    }

    const payload = readToken(data?.accessToken);
    if (!payload) return Response.json({ title: "Geçersiz oturum bilgisi." }, { status: 502 });

    const maxAge = Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
    (await cookies()).set(ADMIN_COOKIE, data.accessToken, cookieOptions(maxAge));

    return Response.json({ user: data.user });
}

export async function DELETE() {
    (await cookies()).set(ADMIN_COOKIE, "", cookieOptions(0));
    return new Response(null, { status: 204 });
}