import { apiGet } from "@/lib/api/client";

/** Backend'in sitemap verisi: yayındaki tüm kayıtların slug'ı ve son güncelleme tarihi */
export const getSitemapData = () => apiGet("/api/sitemap");