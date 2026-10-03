import { apiGet } from "@/lib/api";

/**
 * GET /api/vehicle-segments
 * Tüm aktif araç segmentlerini döndürür.
 */
export async function getVehicleSegments() {
    return apiGet("/api/vehicle-segments");
}