import "server-only";

export const ADMIN_COOKIE = "rt_admin";

/** JWT payload'ını doğrulamadan okur. İmza kontrolü backend'de; burada sadece süre bakılır. */
export function readToken(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
        const json = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
        const payload = JSON.parse(decodeURIComponent(escape(json)));
        if (typeof payload.exp !== "number") return null;
        if (payload.exp * 1000 <= Date.now()) return null; // süresi dolmuş
        return payload;
    } catch {
        return null;
    }
}

export const cookieOptions = (maxAge) => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
});