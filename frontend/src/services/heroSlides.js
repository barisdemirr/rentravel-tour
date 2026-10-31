import { apiGet } from "@/lib/api";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/** GET /api/hero-slides — anasayfa slaytları (yalnızca aktifler, sıralı) */
export function getHeroSlides() {
    return apiGet("/api/hero-slides", PUBLIC_CACHE);
}