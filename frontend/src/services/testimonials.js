import { apiGet, buildQuery } from "@/lib/api";

/** GET /api/testimonials?limit=100 */
export function getTestimonials(params) {
    return apiGet(`/api/testimonials${buildQuery(params)}`);
}