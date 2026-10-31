import { apiGet, apiPost, buildQuery } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

export function getCultureTours(params) {
    return apiGet(`/api/culture-tours${buildQuery(params)}`, PUBLIC_CACHE);
}

export function getCultureTourBySlug(slug) {
    return apiGet(`/api/culture-tours/${encodeURIComponent(slug)}`, PUBLIC_CACHE);
}

export function getCultureTourSessions(slug) {
    return apiGet(`/api/culture-tours/${encodeURIComponent(slug)}/sessions`, PUBLIC_CACHE);
}

/** Turun konaklama seçenekleri ve kişi başı fiyatları: [{ accommodationTypeId, key, label, pricePerPerson }] */
export function getCultureTourAccommodationOptions(slug) {
    return apiGet(`/api/culture-tours/${encodeURIComponent(slug)}/accommodation-options`, PUBLIC_CACHE);
}

/** body: { date, accommodationTypeId, adults, childAges } */
export function quoteCultureTour(slug, body) {
    return apiPost(`/api/culture-tours/${encodeURIComponent(slug)}/quote`, body);
}