import { apiGet } from "@/lib/api/client";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/** Backend'in sitemap verisi: yayındaki tüm kayıtların slug'ı ve son güncelleme tarihi */
export const getSitemapData = () => apiGet("/api/sitemap", PUBLIC_CACHE);