import { buildApiUrl, API_CONFIG } from "./config";
import { parseApiResponse, ApiError } from "./error";

/**
 * Native fetch wrapper.
 * Next.js 15 server component'lerde cache + revalidate desteği ile çalışır.
 *
 * @param {string} path - "/api/vehicle-segments"
 * @param {object} options
 * @param {RequestInit} options.fetchOptions - fetch ayarları (method, body vs.)
 * @param {number} options.revalidate - cache süresi (saniye). 0 = no cache
 * @param {string[]} options.tags - cache tag'leri (revalidateTag için)
 * @returns {Promise<any>}
 */
export async function apiFetch(path, options = {}) {
    const { fetchOptions = {}, revalidate, tags } = options;

    const url = buildApiUrl(path);

    const controller = new AbortController();
    const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.timeout
    );

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                ...(fetchOptions.body ? { "Content-Type": "application/json" } : {}),
                Accept: "application/json",
                ...fetchOptions.headers,
            },
            signal: controller.signal,
            // Next.js cache kontrolü
            next: {
                revalidate:
                    revalidate !== undefined
                        ? revalidate
                        : API_CONFIG.defaultRevalidate,
                tags: tags || undefined,
            },
        });

        return await parseApiResponse(response);
    } catch (err) {
        if (err instanceof ApiError) throw err;

        if (err.name === "AbortError") {
            throw new ApiError({
                status: 0,
                title: "Zaman aşımı",
                detail: "Sunucu belirtilen sürede yanıt vermedi.",
            });
        }

        // Network hatası
        throw new ApiError({
            status: 0,
            title: "Bağlantı hatası",
            detail:
                "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.",
        });
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * GET kısayolu (en sık kullanılan)
 */
export function apiGet(path, options = {}) {
    return apiFetch(path, {
        ...options,
        fetchOptions: { method: "GET", ...options.fetchOptions },
    });
}

/**
 * POST kısayolu
 */
export function apiPost(path, body, options = {}) {
    return apiFetch(path, {
        revalidate: 0,
        ...options,
        fetchOptions: {
            method: "POST",
            body: JSON.stringify(body),
            ...options.fetchOptions,
        },
    });
}

/**
 * PUT kısayolu
 */
export function apiPut(path, body, options = {}) {
    return apiFetch(path, {
        revalidate: 0,
        ...options,
        fetchOptions: {
            method: "PUT",
            body: JSON.stringify(body),
            ...options.fetchOptions,
        },
    });
}

/**
 * DELETE kısayolu
 */
export function apiDelete(path, options = {}) {
    return apiFetch(path, {
        revalidate: 0,
        ...options,
        fetchOptions: { method: "DELETE", ...options.fetchOptions },
    });
}