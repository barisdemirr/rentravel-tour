import { apiGet } from "@/lib/api/client";
import { PUBLIC_CACHE } from "@/lib/api/cache";

export const getSiteSettings = () => apiGet("/api/site-settings", PUBLIC_CACHE);