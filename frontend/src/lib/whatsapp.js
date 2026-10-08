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

export function carMessage({ vehicleName, pickupDate, pickupTime, returnDate, returnTime, days, extras, total, currency, locale }) {
    return compose(
        "Merhaba, araç kiralama talebim var.",
        [
            row("Araç", vehicleName),
            row("Alış", pickupDate ? `${dmy(pickupDate)} — ${pickupTime}` : null),
            row("Teslim", returnDate ? `${dmy(returnDate)} — ${returnTime}` : null),
            row("Süre", days ? `${days} gün` : null),
            row("Ekstralar", extras?.length ? extras.join(", ") : null),
            row("Toplam", money(total, currency)),
        ],
        locale
    );
}

export function corporateMessage({ company, contactName, phone, email, startDate, endDate, months, vehicleType, quantity, notes, locale }) {
    return compose(
        "Merhaba, kurumsal aylık araç kiralama talebim var.",
        [
            row("Firma", company),
            row("Yetkili", contactName),
            row("Telefon", phone),
            row("E-posta", email),
            row("Kiralama Başlangıcı", dmy(startDate)),
            row("Kiralama Bitişi", dmy(endDate)),
            row("Süre", months ? `${months} ay` : null),
            row("Araç Tipi", vehicleType),
            row("Adet", quantity),
            row("Not", notes),
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

export function bungalowMessage({
    bungalowTitle, checkIn, checkOut, nights,
    adults, children, childAges,
    extras,                       // ← YENİ: hazır metin dizisi
    total, currency, locale,
}) {
    return compose(
        "Merhaba, bungalov konaklama rezervasyonu yapmak istiyorum.",
        [
            row("Tesis", bungalowTitle),
            row("Giriş", dmy(checkIn)),
            row("Çıkış", dmy(checkOut)),
            row("Süre", nights ? `${nights} gece` : null),
            row("Yetişkin", adults),
            row("Çocuk", childAges?.length ? ages(childAges) : Number(children) > 0 ? children : null),
            row("Ekstralar", extras?.length ? extras.join(" · ") : null),
            row("Toplam", money(total, currency)),
        ],
        locale
    );
}


/** Genel bilgi talebi: hangi sayfadan gelindiği belirtilir */
export function infoMessage({ topic, locale }) {
    return compose(
        "Merhaba, bilgi almak istiyorum.",
        [row("Konu", topic)],
        locale
    );
}