import { apiGet, apiPost, buildQuery } from "@/lib/api";

export function getCultureTours(params) {
    return apiGet(`/api/culture-tours${buildQuery(params)}`);
}

export function getCultureTourBySlug(slug) {
    return apiGet(`/api/culture-tours/${encodeURIComponent(slug)}`);
}

export function getCultureTourSessions(slug) {
    return apiGet(`/api/culture-tours/${encodeURIComponent(slug)}/sessions`);
}

/** Turun konaklama seçenekleri ve kişi başı fiyatları: [{ accommodationTypeId, key, label, pricePerPerson }] */
export function getCultureTourAccommodationOptions(slug) {
    return apiGet(`/api/culture-tours/${encodeURIComponent(slug)}/accommodation-options`);
}

/** body: { date, accommodationTypeId, adults, childAges } */
export function quoteCultureTour(slug, body) {
    return apiPost(`/api/culture-tours/${encodeURIComponent(slug)}/quote`, body);
}