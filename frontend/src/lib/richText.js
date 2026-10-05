/**
 * Panelden gelen içerik HTML olabilir ya da düz metin olabilir.
 * Düz metinse satır sonları HTML'de kaybolur, bu yüzden paragraflara çeviririz.
 */
export function toHtml(content) {
    const text = (content ?? "").trim();
    if (!text) return "";

    // Blok etiketi varsa zaten HTML: dokunma
    if (/<(p|div|h[1-6]|ul|ol|table|blockquote|section|article|br)\b/i.test(text)) return text;

    return text
        .split(/\n{2,}/) // boş satır = yeni paragraf
        .map((block) => `<p>${block.trim().replace(/\n/g, "<br>")}</p>`) // tek satır sonu = satır atlama
        .join("");
}