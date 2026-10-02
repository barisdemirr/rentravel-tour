import { IMG } from "./constants";

/* ─────────────────────────────────────────────
   MOCK DATA — Backend hazır olunca bu dosya silinecek.
   Her veri "servisten geliyormuş gibi" buradan çekilir.
   ───────────────────────────────────────────── */

export const heroSlides = [
    {
        id: "karadeniz",
        image: IMG.hero1,
        badge: "Özel Karadeniz ve Doğa Rotaları",
        line1: "Karadeniz'in Büyüsünü",
        accent: "Zirvede",
        rest: "Yaşayın",
        text: "Rentravel Turizm güvencesi ve TÜRSAB {tursabNo} no'lu belge ile kişiye özel, konforlu ve unutulmaz seyahat deneyimleri.",
        cta: "Hemen Keşfet",
        alt: "VIP Rezervasyon Hattı",
        altIcon: "call",
        altKind: "phone",
    },
    {
        id: "yayla",
        image: IMG.hero2,
        badge: "Kaçkarlar Bulut Denizi Keşfi",
        line1: "Yayla Rotalarında",
        accent: "Ayrıcalıklı",
        rest: "Konfor",
        text: "Özel 4x4 araçlar, profesyonel rehberler ve seçkin misafirlere özel rota ayrıntılarıyla Kaçkarlar'ı keşfedin.",
        cta: "Yayla Turlarını İncele",
        alt: "WhatsApp VIP Danışman",
        altFallback: "Danışmanımızı Arayın",
        altIcon: "chat",
        altKind: "whatsapp",
    },
    {
        id: "vip-filo",
        image: IMG.hero3,
        badge: "Havalimanı & Bölge Protokolü",
        line1: "VIP Şoförlü",
        accent: "Filo",
        rest: "Hizmeti",
        text: "Trabzon Havalimanı karşılama, iş heyetleri ve özel aile turları için konforlu, kesintisiz transfer hizmeti.",
        cta: "Filoyu Görüntüle",
        alt: "Anında Transfer İste",
        altIcon: "phone_in_talk",
        altKind: "phone",
    },
    {
        id: "kapadokya",
        image: IMG.hero4,
        badge: "Yurtiçi Prestij Koleksiyonu",
        line1: "Kapadokya'dan",
        accent: "Batum'a",
        rest: "Özel Rotalar",
        text: "Transfer, otel konaklaması ve balon rezervasyonları tek elden, Rentravel titizliğiyle hazırlanır.",
        cta: "Paketleri İncele",
        alt: "Kişiye Özel Program",
        altIcon: "support_agent",
        altKind: "phone",
    },
];

/* Rezervasyon tab'ları için seçenekler */
export const bookingOptions = {
    dailyTours: [
        "Uzungöl & Hapsiyaş Köprüsü Turu",
        "Ayder Yaylası & Fırtına Vadisi",
        "Sümela Manastırı & Zigana Hamsiköy",
        "Batum (Gürcistan) Günübirlik",
        "Pokut & Sal Yaylası Bulut Denizi",
    ],
    cultureTours: [
        "Kapadokya Balon & Vadi Masalı (3 Gün)",
        "Karadeniz & Gürcistan Kültür Turu (5 Gün)",
        "Doğu Karadeniz Yayla & Şehir Turu (4 Gün)",
    ],
    accommodationTypes: [
        "5 Yıldızlı Otel",
        "Butik Dağ Oteli",
        "Mağara Otel",
        "Konak (Butik Pansiyon)",
    ],
};

export const SLIDE_DURATION = 4500;



/* ─────────────────────────────────────────────
   ÖNE ÇIKAN ARAÇLAR
   ───────────────────────────────────────────── */
export const featuredVehicles = [
    {
        id: "vito-vip",
        name: "Mercedes Vito VIP",
        category: "VIP Transfer",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPERB3z09aE37y1XmM8MtoK-udic0eaDhb704ZSwrce_vlRK3yseJNnAyMYz4IUONAs6qGLI30LCHIYJNcXWEm5FRUMCa2YD1GIee98OzR9KHl3hYjUuTK9j5i9Kc_cOzqNbFNpvAEUSk_uvmYmDEQoumbBgE3cGR348okHctHZm-iETyu-JHlsgunUuStV51_xXKG5RX96AGBtTwqoqslK7mJDvr-EXA3PO0bC91r6bc8Hd2fUgx50Q",
        seats: 7,
        luggage: 6,
        transmission: "Otomatik",
        fuel: "Dizel",
        badge: "En Çok Tercih Edilen",
        badgeTone: "primary",
        pricePerDay: "₺4.500",
        features: ["Şoförlü", "Klima", "Wi-Fi", "Su İkramı"],
    },
    {
        id: "sprinter-lux",
        name: "Mercedes Sprinter Lüks",
        category: "Grup Transferi",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPERB3z09aE37y1XmM8MtoK-udic0eaDhb704ZSwrce_vlRK3yseJNnAyMYz4IUONAs6qGLI30LCHIYJNcXWEm5FRUMCa2YD1GIee98OzR9KHl3hYjUuTK9j5i9Kc_cOzqNbFNpvAEUSk_uvmYmDEQoumbBgE3cGR348okHctHZm-iETyu-JHlsgunUuStV51_xXKG5RX96AGBtTwqoqslK7mJDvr-EXA3PO0bC91r6bc8Hd2fUgx50Q",
        seats: 16,
        luggage: 14,
        transmission: "Otomatik",
        fuel: "Dizel",
        badge: "Grup & Heyet",
        badgeTone: "dark",
        pricePerDay: "₺7.900",
        features: ["Şoförlü", "Klima", "Wi-Fi", "Geniş Bagaj"],
    },
    {
        id: "bmw-5",
        name: "BMW 5 Serisi",
        category: "Prestij Sedan",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPERB3z09aE37y1XmM8MtoK-udic0eaDhb704ZSwrce_vlRK3yseJNnAyMYz4IUONAs6qGLI30LCHIYJNcXWEm5FRUMCa2YD1GIee98OzR9KHl3hYjUuTK9j5i9Kc_cOzqNbFNpvAEUSk_uvmYmDEQoumbBgE3cGR348okHctHZm-iETyu-JHlsgunUuStV51_xXKG5RX96AGBtTwqoqslK7mJDvr-EXA3PO0bC91r6bc8Hd2fUgx50Q",
        seats: 5,
        luggage: 3,
        transmission: "Otomatik",
        fuel: "Benzin",
        badge: "İş İnsanı",
        badgeTone: "surface",
        pricePerDay: "₺5.200",
        features: ["Şoförlü", "Deri Döşeme", "Klima", "Wi-Fi"],
    },
    {
        id: "range-rover",
        name: "Range Rover Vogue",
        category: "SUV Prestij",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPERB3z09aE37y1XmM8MtoK-udic0eaDhb704ZSwrce_vlRK3yseJNnAyMYz4IUONAs6qGLI30LCHIYJNcXWEm5FRUMCa2YD1GIee98OzR9KHl3hYjUuTK9j5i9Kc_cOzqNbFNpvAEUSk_uvmYmDEQoumbBgE3cGR348okHctHZm-iETyu-JHlsgunUuStV51_xXKG5RX96AGBtTwqoqslK7mJDvr-EXA3PO0bC91r6bc8Hd2fUgx50Q",
        seats: 5,
        luggage: 4,
        transmission: "Otomatik",
        fuel: "Dizel",
        badge: "VIP Protokol",
        badgeTone: "vivid",
        pricePerDay: "₺6.800",
        features: ["Şoförlü", "Masaj Koltuk", "Panoramik", "Wi-Fi"],
    },
    {
        id: "maybach-vito",
        name: "Mercedes Maybach Vito",
        category: "Ultra VIP",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPERB3z09aE37y1XmM8MtoK-udic0eaDhb704ZSwrce_vlRK3yseJNnAyMYz4IUONAs6qGLI30LCHIYJNcXWEm5FRUMCa2YD1GIee98OzR9KHl3hYjUuTK9j5i9Kc_cOzqNbFNpvAEUSk_uvmYmDEQoumbBgE3cGR348okHctHZm-iETyu-JHlsgunUuStV51_xXKG5RX96AGBtTwqoqslK7mJDvr-EXA3PO0bC91r6bc8Hd2fUgx50Q",
        seats: 4,
        luggage: 4,
        transmission: "Otomatik",
        fuel: "Benzin",
        badge: "Ultra Lüks",
        badgeTone: "primary",
        pricePerDay: "₺9.500",
        features: ["Şoförlü", "Masaj Koltuk", "Mini Bar", "Wi-Fi"],
    },
];