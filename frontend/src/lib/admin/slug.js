const MAP = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i", Ç: "c", Ğ: "g", Ö: "o", Ş: "s", Ü: "u" };

/** Türkçe karakterleri çeviren adres üreticisi (backend'deki SlugHelper ile aynı mantık) */
export function slugify(text) {
    return (text ?? "")
        .replace(/[çğıöşüİÇĞÖŞÜ]/g, (c) => MAP[c] ?? c)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 100);
}