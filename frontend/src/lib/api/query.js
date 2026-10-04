/** { featured: true, limit: 8 } -> "?featured=true&limit=8" (boş değerler atlanır) */
export function buildQuery(params = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
    }
    const text = query.toString();
    return text ? `?${text}` : "";
}