/**
 * API konfigürasyonu.
 * Tüm env değişkenleri tek noktadan okunur.
 */

export const API_CONFIG = {
    baseUrl:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5252",
    defaultRevalidate: 60, // saniye — sayfa cache süresi
    timeout: 15000, // ms — fetch timeout
};

/**
 * Full URL üretir: "/api/vehicle-segments" -> "http://localhost:5252/api/vehicle-segments"
 */
export function buildApiUrl(path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_CONFIG.baseUrl}${cleanPath}`;
}