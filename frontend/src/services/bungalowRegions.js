import { apiGet } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/**
 * GET /api/bungalow-regions
 * Tüm aktif bungalov bölgelerini döndürür.
 */
export async function getBungalowRegions() {
    return apiGet("/api/bungalow-regions", PUBLIC_CACHE);
}