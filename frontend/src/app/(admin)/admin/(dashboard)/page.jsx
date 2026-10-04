import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { adminFetch, requireSession } from "@/lib/admin/server";

export const dynamic = "force-dynamic";

const CARDS = [
    { key: "vehicles", path: "/admin/vehicles", href: "/admin/araclar", label: "Araç", icon: "directions_car" },
    { key: "daily", path: "/admin/daily-tours", href: "/admin/gunubirlik-turlar", label: "Günübirlik Tur", icon: "hiking" },
    { key: "culture", path: "/admin/culture-tours", href: "/admin/kultur-turlari", label: "Kültür Turu", icon: "castle" },
    { key: "bungalows", path: "/admin/bungalows", href: "/admin/bungalovlar", label: "Bungalov", icon: "cottage" },
    { key: "testimonials", path: "/admin/testimonials", href: "/admin/yorumlar", label: "Müşteri Yorumu", icon: "reviews" },
    { key: "media", path: "/admin/media", href: "/admin/medya", label: "Medya Dosyası", icon: "photo_library" },
];

const SHORTCUTS = [
    { href: "/admin/fiyat-kurallari", label: "Dönemsel fiyat tanımla", icon: "date_range" },
    { href: "/admin/tur-seferleri", label: "Tur seferi ekle", icon: "event" },
    { href: "/admin/medya", label: "Görsel yükle", icon: "upload" },
    { href: "/admin/site-ayarlari", label: "Site ayarları", icon: "settings" },
];

/** Liste yanıtı dizi veya { items: [...] } olabilir; ikisini de sayar. */
function countOf(data) {
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.items)) return data.items.length;
    return null;
}

function activeOf(data) {
    const list = Array.isArray(data) ? data : data?.items;
    if (!Array.isArray(list)) return null;
    return list.filter((x) => x.isActive !== false).length;
}

export default async function DashboardPage() {
    const { payload } = await requireSession();
    const name = payload.name || payload.unique_name || payload.email || "Yönetici";

    const results = await Promise.all(CARDS.map((c) => adminFetch(c.path, { fallback: [] })));

    const hour = new Date().getHours();
    const greeting = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {/* Karşılama */}
            <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                    {greeting}, {name.split(" ")[0]}
                </h1>
                <p className="mt-1 text-sm text-[var(--ad-muted)]">
                    Siteye yansıyan tüm içeriği buradan yönetebilirsiniz.
                </p>
            </div>

            {/* Sayım kartları */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {CARDS.map((card, i) => {
                    const { data, error } = results[i];
                    const total = countOf(data);
                    const active = activeOf(data);

                    return (
                        <Link
                            key={card.key}
                            href={card.href}
                            className="group flex flex-col gap-3 rounded-2xl border border-[var(--ad-line)] bg-[var(--ad-surface)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--ad-brand)] hover:shadow-md sm:p-5"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ad-brand-soft)] text-[var(--ad-brand)]">
                                    <Icon name={card.icon} className="text-[22px]" />
                                </span>
                                <Icon
                                    name="arrow_outward"
                                    className="text-[18px] text-[var(--ad-muted)] transition-colors group-hover:text-[var(--ad-brand)]"
                                />
                            </div>

                            <div className="min-w-0">
                                <div className="text-2xl font-extrabold leading-none sm:text-3xl">
                                    {error ? <span className="text-base text-[var(--ad-muted)]">—</span> : total}
                                </div>
                                <div className="mt-1.5 truncate text-sm font-semibold">{card.label}</div>
                                <div className="mt-0.5 text-xs text-[var(--ad-muted)]">
                                    {error
                                        ? "Veri alınamadı"
                                        : active != null && active !== total
                                            ? `${active} yayında, ${total - active} pasif`
                                            : "Tümü yayında"}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Kısayollar */}
            <div className="rounded-2xl border border-[var(--ad-line)] bg-[var(--ad-surface)] p-4 shadow-sm sm:p-5">
                <h2 className="mb-3 text-sm font-bold">Hızlı işlemler</h2>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {SHORTCUTS.map((s) => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className="flex items-center gap-2.5 rounded-xl bg-[var(--ad-bg)] px-3 py-3 text-sm font-medium transition-colors hover:bg-[var(--ad-brand-soft)] hover:text-[var(--ad-brand-dark)]"
                        >
                            <Icon name={s.icon} className="shrink-0 text-[20px] text-[var(--ad-brand)]" />
                            <span className="truncate">{s.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}