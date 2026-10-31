import { apiGet, apiPost, buildQuery } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/** GET /api/daily-tours?category=yayla&featured=true&limit=8 */
export function getDailyTours(params) {
    return apiGet(`/api/daily-tours${buildQuery(params)}`, PUBLIC_CACHE);
}

export function getDailyTourBySlug(slug) {
    return apiGet(`/api/daily-tours/${encodeURIComponent(slug)}`, PUBLIC_CACHE);
}

/** Kalkış tarihleri. Boş dizi: tur herhangi bir ileri tarihe rezerve edilebilir. */
export function getDailyTourSessions(slug) {
    return apiGet(`/api/daily-tours/${encodeURIComponent(slug)}/sessions`, PUBLIC_CACHE);
}

/** body: { date, adults, childAges } */
export function quoteDailyTour(slug, body) {
    return apiPost(`/api/daily-tours/${encodeURIComponent(slug)}/quote`, body);
}