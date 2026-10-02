export const SITE = {
    name: "Rentravel",
    whatsapp: "908503096100",
    phone: "0850 309 61 00",
    phoneHref: "tel:08503096100",
    address: "Konaklar, Alper Sk. No:13, 61080 Ortahisar / Trabzon",
    tursabNo: "15869",
    tursabUrl: "https://www.tursab.org.tr/tr/ddsv",
    tursabImage: "",
    email: "",
    hours: "",
    socials: [],
};

export const HOVER_RED = "#ff1e38";

export const IMG = {
    logo: "/logo.png",
    logoMobile: "/logohamburger.png",
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