export const API_CONFIG = {
    // Sunucu tarafında API_URL (varsa) kullanılır, tarayıcıda NEXT_PUBLIC_API_URL
    baseUrl:
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5252",
    defaultRevalidate: 60, // saniye — sayfa cache süresi
    timeout: 15000, // ms — fetch timeout
};

export function buildApiUrl(path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_CONFIG.baseUrl}${cleanPath}`;
}