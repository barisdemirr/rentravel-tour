import { apiGet, buildQuery } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/** GET /api/testimonials?limit=100 */
export function getTestimonials(params) {
    return apiGet(`/api/testimonials${buildQuery(params)}`, PUBLIC_CACHE);
}