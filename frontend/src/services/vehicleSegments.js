import { apiGet } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/**
 * GET /api/vehicle-segments
 * Tüm aktif araç segmentlerini döndürür.
 */
export async function getVehicleSegments() {
    return apiGet("/api/vehicle-segments", PUBLIC_CACHE);
}