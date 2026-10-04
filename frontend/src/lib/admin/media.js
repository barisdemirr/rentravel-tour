/** Backend göreli yollar döndürüyor (/uploads/...), tarayıcı için başına sunucu adresi gerekir */
const BASE = process.env.NEXT_PUBLIC_API_URL 

export function absoluteUrl(path) {
    if (!path) return "";
    if (/^(https?:|data:|blob:)/.test(path)) return path; // zaten tam adres
    return `${BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** MediaAssetDto için: assetUrl(asset, "thumb" | "md" | "lg" | "original") */
export function assetUrl(asset, size = "thumb") {
    return absoluteUrl(asset?.urls?.[size] ?? asset?.urls?.original);
}