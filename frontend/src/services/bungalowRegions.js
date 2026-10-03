import { apiGet } from "@/lib/api";

/**
 * GET /api/bungalow-regions
 * Tüm aktif bungalov bölgelerini döndürür.
 */
export async function getBungalowRegions() {
    return apiGet("/api/bungalow-regions");
}