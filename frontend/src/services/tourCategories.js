import { apiGet } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/**
 * GET /api/tour-categories
 * @param {"daily"|"culture"|undefined} scope
 * - scope verilmezse: tüm kategoriler
 * - scope=daily: sadece Daily veya Both
 * - scope=culture: sadece Culture veya Both
 */
export async function getTourCategories(scope) {
    const query = scope ? `?scope=${encodeURIComponent(scope)}` : "";
    return apiGet(`/api/tour-categories${query}`, PUBLIC_CACHE);
}