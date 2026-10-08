import { apiGet } from "@/lib/api";

/** GET /api/hero-slides — anasayfa slaytları (yalnızca aktifler, sıralı) */
export function getHeroSlides() {
    return apiGet("/api/hero-slides");
}