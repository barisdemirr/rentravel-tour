import { apiGet } from "@/lib/api/client";
import { PUBLIC_CACHE } from "@/lib/api/cache";

/** Alt menü bağlantıları: yayındaki sayfaların slug ve başlıkları */
export const getStaticPages = () => apiGet("/api/static-pages", PUBLIC_CACHE);

/** Tek sayfanın içeriği */
export const getStaticPageBySlug = (slug) => apiGet(`/api/static-pages/${slug}`, PUBLIC_CACHE);