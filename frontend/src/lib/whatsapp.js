import { formatDate, formatPrice } from "@/lib/format";

// Mesajlar her zaman Türkçe (ekip tek tip okusun). Müşterinin dili son satırda belirtilir.
const LANG_NAMES = { tr: "Türkçe", en: "İngilizce", ar: "Arapça" };

/** "2027-07-15" -> "15.07.2027" */
const dmy = (iso) => {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-");
    return `${d}.${m}.${y}`;
};

const row = (label, value) => (value == null || value === "" ? null : `• ${label}: ${value}`);
const ages = (list) => (list?.length ? `${list.length} (${list.join(", ")} yaş)` : null);
const money = (amount, currency) =>
    amount == null ? null : formatPrice(amount, currency, "tr", { suffix: true });

function compose(intro, rows, locale) {
    return [intro, "", ...rows, row("Dil", LANG_NAMES[locale])].filter((line) => line !== null).join("\n");
}

export function carMessage({ vehicleName, pickupDate, pickupTime, returnDate, returnTime, days, total, currency, locale }) {
    return compose(
        "Merhaba, araç kiralama talebim var.",
        [
            row("Araç", vehicleName),
            row("Alış", pickupDate ? `${dmy(pickupDate)} — ${pickupTime}` : null),
            row("Teslim", returnDate ? `${dmy(returnDate)} — ${returnTime}` : null),
            row("Süre", days ? `${days} gün` : null),
            row("Toplam", money(total, currency)),
        ],
        locale
    );
}

export function dailyTourMessage({ tourTitle, date, adults, childAges, total, currency, locale }) {
    return compose(
        "Merhaba, günübirlik tur rezervasyonu yapmak istiyorum.",
        [
            row("Tur", tourTitle),
            row("Tarih", date ? formatDate(date, "tr") : null),
            row("Yetişkin", adults),
            row("Çocuk", ages(childAges)),
            row("Toplam", money(total, currency)),
        ],
        locale
    );
}

export function cultureTourMessage({ tourTitle, date, accommodation, adults, childAges, total, currency, locale }) {
    return compose(
        "Merhaba, konaklamalı kültür turu rezervasyonu yapmak istiyorum.",
        [
            row("Tur", tourTitle),
            row("Kalkış", date ? formatDate(date, "tr") : null),
            row("Konaklama", accommodation),
            row("Yetişkin", adults),
            row("Çocuk", ages(childAges)),
            row("Toplam", money(total, currency)),
        ],
        locale
    );
}

export function bungalowMessage({ bungalowTitle, checkIn, checkOut, nights, adults, children, childAges, total, currency, locale }) {
    return compose(
        "Merhaba, bungalov konaklama rezervasyonu yapmak istiyorum.",
        [
            row("Tesis", bungalowTitle),
            row("Giriş", dmy(checkIn)),
            row("Çıkış", dmy(checkOut)),
            row("Süre", nights ? `${nights} gece` : null),
            row("Yetişkin", adults),
            row("Çocuk", childAges?.length ? ages(childAges) : Number(children) > 0 ? children : null),
            row("Toplam", money(total, currency)),
        ],
        locale
    );
}


/** Kartlardaki "Bilgi Al" butonu için: infoMessage({ subject: "Mercedes Vito aracı", locale }) */
export function infoMessage({ subject, locale }) {
    return compose(`Merhaba, ${subject} hakkında bilgi almak istiyorum.`, [], locale);
}