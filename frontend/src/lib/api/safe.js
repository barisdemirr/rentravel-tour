/** Bir istek hata verirse sayfayı düşürmez, varsayılan değeri döndürür. */
export async function safe(promise, fallback = []) {
    try {
        return await promise;
    } catch (error) {
        console.error("[api]", error?.message ?? error);
        return fallback;
    }
}