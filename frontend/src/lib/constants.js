export const SITE = {
    name: "Rentravel",
    whatsapp: "908503096100",
    phone: "0850 309 61 00",
    phoneHref: "tel:+908503096100",
    address: "Konaklar Mah. Alper Sk. No:13 Ortahisar/Trabzon",
    tursabNo: "15869",
    tursabUrl: "https://www.tursab.org.tr/tr/ddsv",
    tursabImage: "",
    email: "info@rentravel.com.tr",
    hours: "",
    instagram: "https://www.instagram.com/rentravel",
    instagramHandle: "@rentravel",
    tiktok: "https://www.tiktok.com/@rentravelco",
    tiktokHandle: "@rentravelco",
};

export const HOVER_RED = "#ff1e38";

export const IMG = {
    logo: "rentravel-logo-renkli-600.png",
    logoMobile: "/rentravel-logo-kirmizi-beyaz-600.png",
    hero1: "/hero_images/hero1.jpg",
    hero2: "/hero_images/hero2.jpg",
    hero3: "/hero_images/hero3.jpg",
    hero4: "/hero_images/hero4.jpg",
};

// WhatsApp linkini her yerden çağırabilmek için
export const waHref = (message) => {
    if (!SITE.whatsapp) return null;
    const base = `https://wa.me/${SITE.whatsapp}`;
    return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};


/* Splash screen süresi (ms) */
export const SPLASH_DURATION = 1800;

/* Hero slayt süresi (ms) */
export const SLIDE_DURATION = 4500;

export const SPLASH_STORAGE_KEY = "rentravel-splash-seen";