/**
 * Backend'in application/problem+json formatını parse eder.
 * Doküman: Bölüm 3 - Hata Formatı
 */

export class ApiError extends Error {
    constructor({ status, title, detail, errors, type }) {
        super(title || `API Error ${status}`);
        this.name = "ApiError";
        this.status = status;
        this.title = title;
        this.detail = detail;
        this.errors = errors || null; // { "label.tr": ["..."], ... }
        this.type = type || null;
    }

    /**
     * Validation hatası mı? (400 + errors objesi)
     */
    isValidationError() {
        return this.status === 400 && this.errors != null;
    }

    /**
     * Field bazlı hata mesajı al.
     */
    getFieldError(fieldName) {
        if (!this.errors) return null;
        const list = this.errors[fieldName];
        return list && list.length > 0 ? list[0] : null;
    }

    /**
     * Tüm hata mesajlarını düz liste olarak döndür.
     */
    getAllMessages() {
        if (this.errors) {
            return Object.values(this.errors).flat();
        }
        return this.detail ? [this.detail] : [this.title];
    }
}

/**
 * Response'u parse edip uygun hata fırlatır.
 * Başarılıysa response döner, değilse ApiError fırlatır.
 */
export async function parseApiResponse(response) {
    if (response.ok) {
        // 204 No Content
        if (response.status === 204) return null;

        // Normal JSON
        const text = await response.text();
        if (!text) return null;
        try {
            return JSON.parse(text);
        } catch {
            throw new ApiError({
                status: response.status,
                title: "Geçersiz JSON yanıtı",
                detail: "Sunucudan beklenen formatta yanıt gelmedi.",
            });
        }
    }

    // Hata durumları
    let problem = null;
    try {
        problem = await response.json();
    } catch {
        // JSON değilse
    }

    throw new ApiError({
        status: response.status,
        title: problem?.title || `HTTP ${response.status}`,
        detail: problem?.detail || null,
        errors: problem?.errors || null,
        type: problem?.type || null,
    });
}