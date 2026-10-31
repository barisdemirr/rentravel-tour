import { apiGet, apiPost, buildQuery } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/** GET /api/bungalows?region=ayder&featured=true&limit=8 */
export function getBungalows(params) {
    return apiGet(`/api/bungalows${buildQuery(params)}`, PUBLIC_CACHE);
}

export function getBungalowBySlug(slug) {
    return apiGet(`/api/bungalows/${encodeURIComponent(slug)}`, PUBLIC_CACHE);
}

/** body: { checkInDate, checkOutDate, adults, childAges } */
export function quoteBungalow(slug, body) {
    return apiPost(`/api/bungalows/${encodeURIComponent(slug)}/quote`, body);
}