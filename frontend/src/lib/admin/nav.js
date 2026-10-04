/** Sidebar grupları. Yeni sayfa eklerken sadece burayı güncelle. */
export const NAV_GROUPS = [
    {
        key: "overview",
        items: [{ href: "/admin", label: "Panel", icon: "dashboard", exact: true }],
    },
    {
        key: "products",
        label: "Ürünler",
        icon: "inventory_2",
        items: [
            { href: "/admin/araclar", label: "Araçlar", icon: "directions_car" },
            { href: "/admin/gunubirlik-turlar", label: "Günübirlik Turlar", icon: "hiking" },
            { href: "/admin/kultur-turlari", label: "Kültür Turları", icon: "castle" },
            { href: "/admin/bungalovlar", label: "Bungalovlar", icon: "cottage" },
        ],
    },
    {
        key: "catalog",
        label: "Katalog",
        icon: "category",
        items: [
            { href: "/admin/katalog/arac-segmentleri", label: "Araç Segmentleri", icon: "label" },
            { href: "/admin/katalog/arac-ekstralari", label: "Araç Ekstraları", icon: "add_circle" },
            { href: "/admin/katalog/tur-kategorileri", label: "Tur Kategorileri", icon: "sell" },
            { href: "/admin/katalog/bungalov-bolgeleri", label: "Bungalov Bölgeleri", icon: "map" },
            { href: "/admin/katalog/konaklama-tipleri", label: "Konaklama Tipleri", icon: "hotel" },
        ],
    },
    {
        key: "pricing",
        label: "Fiyatlama",
        icon: "payments",
        items: [
            { href: "/admin/fiyat-kurallari", label: "Dönemsel Fiyatlar", icon: "date_range" },
            { href: "/admin/yas-fiyatlari", label: "Yaş Fiyatları", icon: "child_care" },
            { href: "/admin/tur-seferleri", label: "Tur Seferleri", icon: "event" },
        ],
    },
    {
        key: "content",
        label: "İçerik",
        icon: "article",
        items: [
            { href: "/admin/medya", label: "Medya", icon: "photo_library" },
            { href: "/admin/yorumlar", label: "Müşteri Yorumları", icon: "reviews" },
            { href: "/admin/sayfalar", label: "Statik Sayfalar", icon: "description" },
            { href: "/admin/site-ayarlari", label: "Site Ayarları", icon: "settings" },
        ],
    },
    {
        key: "system",
        label: "Sistem",
        icon: "admin_panel_settings",
        items: [
            { href: "/admin/kullanicilar", label: "Yöneticiler", icon: "group" },
            { href: "/admin/profil", label: "Profilim", icon: "account_circle" },
        ],
    },
];

/** Bir yol hangi gruba ait, açılır menü açık başlasın diye */
export function groupOf(pathname) {
    return NAV_GROUPS.find((g) => g.items.some((i) => pathname.startsWith(i.href) && i.href !== "/admin"))?.key;
}