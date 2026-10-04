/** Listeyi orderIndex'e göre sıralar (eşitlik durumunda oluşturma tarihi) */
export function sortByOrder(list) {
    return [...list].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || String(a.createdAt).localeCompare(String(b.createdAt))
    );
}

/** Bir öğeyi delta kadar taşır (±1 komşu, ±Infinity uç) */
export function move(list, index, delta) {
    const target = delta === Infinity ? list.length - 1 : delta === -Infinity ? 0 : index + delta;
    if (target < 0 || target >= list.length || target === index) return list;

    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    return next;
}

/** Sıralanmış listeyi 0'dan başlayarak yeniden numaralar: çakışma kalmaz */
export function normalize(list) {
    return list.map((item, i) => ({ ...item, orderIndex: i }));
}

/** Sadece indeksi değişen kayıtları döndürür */
export function changed(original, next) {
    const before = new Map(original.map((r) => [r.id, r.orderIndex ?? 0]));
    return next.filter((r) => before.get(r.id) !== r.orderIndex);
}

/** Yeni kayıt için sıradaki indeks */
export function nextIndex(list) {
    return list.length === 0 ? 0 : Math.max(...list.map((r) => r.orderIndex ?? 0)) + 1;
}