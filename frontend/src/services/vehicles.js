import { apiGet, apiPost, buildQuery } from "@/lib/api";

/** GET /api/vehicles?segment=suv&featured=true&limit=8 */
export function getVehicles(params) {
    return apiGet(`/api/vehicles${buildQuery(params)}`);
}

/** GET /api/vehicles/{slug} */
export function getVehicleBySlug(slug) {
    return apiGet(`/api/vehicles/${encodeURIComponent(slug)}`);
}

/**
 * POST /api/vehicles/{slug}/quote
 * body: { pickupDate, pickupTime, returnDate, returnTime, extraIds }
 */
export function quoteVehicle(slug, body) {
    return apiPost(`/api/vehicles/${encodeURIComponent(slug)}/quote`, body);
}