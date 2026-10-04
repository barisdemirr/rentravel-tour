/**
 * Backend'den gelen { tr, en, ar } alanından seçili dili döndürür, boşsa Türkçeye düşer.
 * Düz string gelirse olduğu gibi döner.
 */
export function localized(field, locale = "tr") {
    if (field == null) return "";
    if (typeof field === "string") return field;
    const key = String(locale).toLowerCase();
    return field[key] || field.tr || "";
}