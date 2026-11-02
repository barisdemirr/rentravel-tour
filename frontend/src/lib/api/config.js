export const API_CONFIG = {
    // Sunucu tarafında API_URL (varsa) kullanılır, tarayıcıda NEXT_PUBLIC_API_URL
    baseUrl:
        process.env.API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5252",
    defaultRevalidate: 1800, // saniye — açıkça süre verilmeyen GET'ler de 30 dk önbellekte kalır
    timeout: 8000, // ms — backend bu sürede cevap vermezse vazgeç (bekleyen her saniye Vercel'de ücretli)
};

export function buildApiUrl(path) {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_CONFIG.baseUrl}${cleanPath}`;
}