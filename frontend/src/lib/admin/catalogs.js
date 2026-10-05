/**
 * Katalog varlıkları: hepsi anahtar + çok dilli etiket + sıra şemasında.
 * Yeni katalog eklemek için buraya bir giriş yazmak yeterli, rota dosyaları ortak.
 *
 * Alan tipleri: key | localized | icon | number | money | select | media
 */
export const CATALOGS = {
    "arac-segmentleri": {
        api: "vehicle-segments",
        title: "Araç Segmentleri",
        singular: "Segment",
        description: "Araç kiralama sayfasındaki filtre sekmeleri bu listeden gelir.",
        icon: "label",
        titleField: "label",
        fields: [
            { name: "label", type: "localized", label: "Etiket", required: true, maxLength: 60 },
            { name: "icon", type: "icon", label: "İkon", required: true },
            { name: "orderIndex", type: "order" },
        ],
    },

    "arac-ekstralari": {
        api: "vehicle-extras",
        title: "Araç Ekstraları",
        singular: "Ekstra",
        description: "Araçlara atanabilen ek hizmetler. Araca atandığında fiyatı o an kopyalanır.",
        icon: "add_circle",
        titleField: "title",
        fields: [
            {
                name: "key",
                type: "key",
                label: "Anahtar",
                required: true,
                lowercase: false,
                hint: "Küçük/büyük harf korunur: youngDriver, babySeat",
            },
            { name: "title", type: "localized", label: "Başlık", required: true, maxLength: 80 },
            {
                name: "description",
                type: "localized",
                label: "Açıklama",
                required: true,
                multiline: true,
                maxLength: 200,
            },
            {
                name: "tooltip",
                type: "localized",
                label: "Bilgi balonu",
                hint: "Kart üzerindeki (i) simgesinde çıkar, boş bırakılabilir",
                maxLength: 200,
            },
            { name: "icon", type: "icon", label: "İkon", required: true },
            { name: "dailyPrice", type: "money", label: "Günlük Ücret", required: true },
            { name: "currency", type: "currency", label: "Para Birimi", required: true },
            { name: "orderIndex", type: "order" },
        ],
        extraColumns: [
            {
                key: "price",
                header: "Günlük",
                render: (row) =>
                    new Intl.NumberFormat("tr-TR", { style: "currency", currency: row.currency || "TRY" }).format(
                        row.dailyPrice ?? 0
                    ),
            },
        ],
    },

    "tur-kategorileri": {
        api: "tour-categories",
        title: "Tur Kategorileri",
        singular: "Kategori",
        description: "Günübirlik ve kültür turlarının filtre sekmeleri.",
        icon: "sell",
        titleField: "label",
        fields: [
            { name: "label", type: "localized", label: "Etiket", required: true, maxLength: 60 },
            { name: "icon", type: "icon", label: "İkon", required: true },
            {
                name: "appliesTo",
                type: "select",
                label: "Kullanım Alanı",
                required: true,
                default: "Both",
                options: [
                    { value: "Daily", label: "Sadece günübirlik turlar" },
                    { value: "Culture", label: "Sadece kültür turları" },
                    { value: "Both", label: "İkisinde de" },
                ],
            },
            { name: "orderIndex", type: "order" },
        ],
        extraColumns: [
            {
                key: "appliesTo",
                header: "Kullanım",
                render: (row) =>
                    ({ Daily: "Günübirlik", Culture: "Kültür", Both: "İkisi de" })[row.appliesTo] ?? row.appliesTo,
            },
        ],
    },

    "bungalov-bolgeleri": {
        api: "bungalow-regions",
        title: "Bungalov Bölgeleri",
        singular: "Bölge",
        description: "Bungalov listesindeki bölge kartları. Görsel boşsa bölgenin ilk bungalovunun görseli kullanılır.",
        icon: "map",
        titleField: "shortLabel",
        fields: [
            {
                name: "shortLabel",
                type: "localized",
                label: "Kısa Ad",
                required: true,
                maxLength: 40,
                hint: "Bölge kartında ve rozetlerde görünür",
            },
            {
                name: "fullLabel",
                type: "localized",
                label: "Tam Ad",
                required: true,
                maxLength: 100,
                hint: "Detay sayfasında görünür: Ayder Yaylası, Çamlıhemşin / Rize",
            },
            { name: "thumbnail", type: "media", label: "Bölge Görseli", category: "Bungalow" },
            { name: "orderIndex", type: "order" },
        ],
    },

    "konaklama-tipleri": {
        api: "accommodation-types",
        title: "Konaklama Tipleri",
        singular: "Konaklama Tipi",
        description: "Kültür turlarında seçilen otel tipleri. Fiyatlar tur bazında ayrıca girilir.",
        icon: "hotel",
        titleField: "label",
        fields: [
            { name: "label", type: "localized", label: "Etiket", required: true, maxLength: 60 },
            {
                name: "description",
                type: "localized",
                label: "Açıklama",
                multiline: true,
                maxLength: 200,
                hint: "Seçim kartında etiketin altında görünür",
            },
            { name: "icon", type: "icon", label: "İkon" },
            { name: "orderIndex", type: "order" },
        ],
    },
};

export const catalogSlugs = Object.keys(CATALOGS);


/** DTO kaydından PUT gövdesi üretir (sıralama gibi yerinde güncellemeler için) */
export function catalogPayload(catalog, record, overrides = {}) {
    const body = { isActive: record.isActive ?? true };
    for (const field of catalog.fields) {
        body[field.name] = record[field.name] ?? null;
    }
    return { ...body, ...overrides };
}