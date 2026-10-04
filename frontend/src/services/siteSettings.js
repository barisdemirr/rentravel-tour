import { apiGet } from "@/lib/api/client";

export const getSiteSettings = () => apiGet("/api/site-settings");