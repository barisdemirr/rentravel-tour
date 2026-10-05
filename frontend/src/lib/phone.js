/**
 * Telefon alanı için ülke listesi.
 * digits: ülke kodundan sonraki basamak sayısı (tek sayı veya aralık)
 * trunk: yerel yazımda başa eklenen rakam (Türkiye'de 0), girişte temizlenir
 * Sıralama: hedef kitleye göre önce Türkiye ve Körfez ülkeleri.
 */
export const COUNTRIES = [
    { code: "TR", dial: "90", flag: "🇹🇷", name: "Türkiye", digits: [10], trunk: "0", groups: [3, 3, 2, 2] },
    { code: "SA", dial: "966", flag: "🇸🇦", name: "Suudi Arabistan", digits: [9], trunk: "0", groups: [2, 3, 4] },
    { code: "AE", dial: "971", flag: "🇦🇪", name: "BAE", digits: [9], trunk: "0", groups: [2, 3, 4] },
    { code: "QA", dial: "974", flag: "🇶🇦", name: "Katar", digits: [8], groups: [4, 4] },
    { code: "KW", dial: "965", flag: "🇰🇼", name: "Kuveyt", digits: [8], groups: [4, 4] },
    { code: "BH", dial: "973", flag: "🇧🇭", name: "Bahreyn", digits: [8], groups: [4, 4] },
    { code: "OM", dial: "968", flag: "🇴🇲", name: "Umman", digits: [8], groups: [4, 4] },
    { code: "IQ", dial: "964", flag: "🇮🇶", name: "Irak", digits: [10], trunk: "0", groups: [3, 3, 4] },
    { code: "JO", dial: "962", flag: "🇯🇴", name: "Ürdün", digits: [9], trunk: "0", groups: [1, 4, 4] },
    { code: "LB", dial: "961", flag: "🇱🇧", name: "Lübnan", digits: [7, 8], trunk: "0", groups: [2, 3, 3] },
    { code: "EG", dial: "20", flag: "🇪🇬", name: "Mısır", digits: [10], trunk: "0", groups: [3, 3, 4] },
    { code: "DE", dial: "49", flag: "🇩🇪", name: "Almanya", digits: [10, 11], trunk: "0", groups: [4, 4, 4] },
    { code: "NL", dial: "31", flag: "🇳🇱", name: "Hollanda", digits: [9], trunk: "0", groups: [3, 3, 3] },
    { code: "GB", dial: "44", flag: "🇬🇧", name: "Birleşik Krallık", digits: [10], trunk: "0", groups: [4, 3, 3] },
    { code: "FR", dial: "33", flag: "🇫🇷", name: "Fransa", digits: [9], trunk: "0", groups: [1, 2, 2, 2, 2] },
    { code: "RU", dial: "7", flag: "🇷🇺", name: "Rusya", digits: [10], trunk: "8", groups: [3, 3, 2, 2] },
    { code: "US", dial: "1", flag: "🇺🇸", name: "ABD / Kanada", digits: [10], groups: [3, 3, 4] },
];

export const findCountry = (code) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

/**
 * Girilen metni temizler: rakam dışını atar, ülke kodunu ve baştaki sıfırı siler.
 * Yapıştırılan numarada başka bir ülke kodu varsa onu da bildirir.
 */
export function normalizePhone(input, country) {
    const raw = String(input ?? "");
    let digits = raw.replace(/\D/g, "");

    // Kullanıcı + ile başka bir ülke kodu yapıştırdıysa ülkeyi değiştirmeyi öner
    if (raw.trim().startsWith("+")) {
        const match = [...COUNTRIES]
            .sort((a, b) => b.dial.length - a.dial.length)
            .find((c) => digits.startsWith(c.dial));

        if (match && match.code !== country.code) {
            return { digits: trimTrunk(digits.slice(match.dial.length), match), switchTo: match };
        }
    }

    // Seçili ülkenin kodu başta yazılmışsa at (90 532..., +90 532...)
    if (digits.startsWith(country.dial) && digits.length > country.dial.length) {
        const rest = digits.slice(country.dial.length);
        // 90 ile başlayan geçerli bir yerel numara olabilir, uzunluğa bakarak karar ver
        if (rest.length >= Math.min(...country.digits)) digits = rest;
    }

    return { digits: trimTrunk(digits, country), switchTo: null };
}

/** Baştaki yerel ön eki (Türkiye'de 0) temizler */
function trimTrunk(digits, country) {
    let out = digits;
    while (country.trunk && out.startsWith(country.trunk)) out = out.slice(1);
    return out.slice(0, Math.max(...country.digits));
}

/** Okunur gruplara ayırır: 5321234567 → 532 123 45 67 */
export function formatPhone(digits, country) {
    const parts = [];
    let index = 0;

    for (const size of country.groups) {
        if (index >= digits.length) break;
        parts.push(digits.slice(index, index + size));
        index += size;
    }

    if (index < digits.length) parts.push(digits.slice(index));
    return parts.join(" ");
}

/** Numara tam mı */
export const isPhoneComplete = (digits, country) => country.digits.includes(digits.length);

/** Backend'e gönderilecek tam hali: +905321234567 */
export const fullPhone = (digits, country) => `+${country.dial}${digits}`;