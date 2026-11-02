import { getSitemapData } from "@/services/sitemap";

/**
 * Detay sayfalarının slug listesi (derleme sırasında hazır HTML üretmek için).
 * Tek bir backend çağrısı (sitemap verisi) tüm listeyi verir.
 *
 * Neden önemli: Türkçe adresler middleware'de /tr/... adresine yeniden yazılıyor. Derlemede
 * üretilmiş sayfalar bu yolla da önbellekten gelir. Liste alınamazsa (backend kapalı) boş döner;
 * sayfalar o zaman ilk ziyarette üretilip önbelleğe alınır, derleme yine başarılı olur.
 *
 * @param {"vehicles"|"dailyTours"|"cultureTours"|"bungalows"|"staticPages"} key
 */
export async function slugParams(key) {
    try {
        const data = await getSitemapData();
        const list = Array.isArray(data?.[key]) ? data[key] : [];
        return list.filter((item) => typeof item?.slug === "string" && item.slug).map((item) => ({ slug: item.slug }));
    } catch {
        return [];
    }
}

/**
 * Slug yayındaki kayıtlardan biri mi? Liste önbellekten gelir (panelde kayıt değişince tazelenir).
 * Bot taramalarındaki uydurma adresler böylece backend'e tek tek istek atmaz.
 * Liste alınamazsa (backend kapalı) true döner: sayfa eskisi gibi doğrudan sorulur.
 */
export async function isKnownSlug(key, slug) {
    if (typeof slug !== "string" || !slug || slug.length > 200) return false;
    try {
        const data = await getSitemapData();
        const list = data?.[key];
        if (!Array.isArray(list)) return true;
        return list.some((item) => item?.slug === slug);
    } catch {
        return true;
    }
}
