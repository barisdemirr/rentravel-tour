"use client";

import { track } from "./progress";

/** Panelden yapılan tüm istekler Next proxy'si üzerinden gider (token httpOnly cookie'de). */
export class AdminError extends Error {
    constructor(status, body) {
        super(body?.title || body?.detail || "Bir hata oluştu.");
        this.status = status;
        this.errors = body?.errors || null; // { alanAdı: ["mesaj"] }
    }

    /** Doğrulama hatalarını tek metne çevirir */
    messages() {
        if (!this.errors) return this.message;
        return Object.values(this.errors).flat().join(" ");
    }

    /** Belirli bir alanın hatası */
    fieldError(name) {
        return this.errors?.[name]?.[0] ?? null;
    }
}

async function request(method, path, body, { isForm = false } = {}) {
    const init = { method, cache: "no-store" };

    if (body !== undefined) {
        if (isForm) {
            init.body = body; // FormData: Content-Type'ı tarayıcı koyar
        } else {
            init.headers = { "Content-Type": "application/json" };
            init.body = JSON.stringify(body);
        }
    }

    // Süren istekler üst çubuğa ve "işleniyor" rozetine yansır
    const response = await track(fetch(`/api/backend${path}`, init));

    if (response.status === 401) {
        window.location.href = "/admin/login?expired=1";
        throw new AdminError(401, { title: "Oturum süresi doldu." });
    }

    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);
    if (!response.ok) throw new AdminError(response.status, data);
    return data;
}

export const adminGet = (path) => request("GET", path);
export const adminPost = (path, body) => request("POST", path, body);
export const adminPut = (path, body) => request("PUT", path, body);
export const adminDelete = (path) => request("DELETE", path);
export const adminUpload = (path, formData) => request("POST", path, formData, { isForm: true });

export async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    window.location.href = "/admin/login";
}