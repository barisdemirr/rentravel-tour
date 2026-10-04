import { apiGet } from "@/lib/api/client";

/** Alt menü bağlantıları: yayındaki sayfaların slug ve başlıkları */
export const getStaticPages = () => apiGet("/api/static-pages");

/** Tek sayfanın içeriği */
export const getStaticPageBySlug = (slug) => apiGet(`/api/static-pages/${slug}`);