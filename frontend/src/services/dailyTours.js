import { apiGet, apiPost, buildQuery } from "@/lib/api";

/** GET /api/daily-tours?category=yayla&featured=true&limit=8 */
export function getDailyTours(params) {
    return apiGet(`/api/daily-tours${buildQuery(params)}`);
}

export function getDailyTourBySlug(slug) {
    return apiGet(`/api/daily-tours/${encodeURIComponent(slug)}`);
}

/** Kalkış tarihleri. Boş dizi: tur herhangi bir ileri tarihe rezerve edilebilir. */
export function getDailyTourSessions(slug) {
    return apiGet(`/api/daily-tours/${encodeURIComponent(slug)}/sessions`);
}

/** body: { date, adults, childAges } */
export function quoteDailyTour(slug, body) {
    return apiPost(`/api/daily-tours/${encodeURIComponent(slug)}/quote`, body);
}