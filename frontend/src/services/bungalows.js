import { apiGet, apiPost, buildQuery } from "@/lib/api";

/** GET /api/bungalows?region=ayder&featured=true&limit=8 */
export function getBungalows(params) {
    return apiGet(`/api/bungalows${buildQuery(params)}`);
}

export function getBungalowBySlug(slug) {
    return apiGet(`/api/bungalows/${encodeURIComponent(slug)}`);
}

/** body: { checkInDate, checkOutDate, adults, childAges } */
export function quoteBungalow(slug, body) {
    return apiPost(`/api/bungalows/${encodeURIComponent(slug)}/quote`, body);
}