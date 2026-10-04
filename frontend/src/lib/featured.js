/** Öne çıkan olarak işaretlenenler. Hiç işaretli yoksa listenin ilk kayıtları. */
export function featuredOf(list = [], fallbackCount = 8) {
    const featured = list.filter((item) => item.isFeatured);
    return featured.length > 0 ? featured : list.slice(0, fallbackCount);
}