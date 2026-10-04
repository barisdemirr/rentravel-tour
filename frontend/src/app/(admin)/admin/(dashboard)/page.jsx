import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { adminFetch, requireSession } from "@/lib/admin/server";

export const dynamic = "force-dynamic";

const CARDS = [
    { path: "/admin/vehicles", href: "/admin/araclar", label: "Araç", icon: "directions_car" },
    { path: "/admin/daily-tours", href: "/admin/gunubirlik-turlar", label: "Günübirlik Tur", icon: "hiking" },
    { path: "/admin/culture-tours", href: "/admin/kultur-turlari", label: "Kültür Turu", icon: "castle" },
    { path: "/admin/bungalows", href: "/admin/bungalovlar", label: "Bungalov", icon: "cottage" },
    { path: "/admin/testimonials", href: "/admin/yorumlar", label: "Müşteri Yorumu", icon: "reviews" },
    { path: "/admin/media", href: "/admin/medya", label: "Medya Dosyası", icon: "photo_library" },
];

const SHORTCUTS = [
    { href: "/admin/araclar/yeni", label: "Araç ekle", sub: "Filoya yeni araç", icon: "add_circle" },
    { href: "/admin/fiyat-kurallari", label: "Dönemsel fiyat", sub: "Sezon fiyatı tanımla", icon: "date_range" },
    { href: "/admin/tur-seferleri", label: "Tur seferi", sub: "Tarih ve kontenjan", icon: "event" },
    { href: "/admin/medya", label: "Görsel yükle", sub: "Medya kütüphanesi", icon: "upload" },
];

const asList = (data) => (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null);

export default async function DashboardPage() {
    const { payload } = await requireSession();
    const name = payload.name || payload.unique_name || payload.email || "Yönetici";
    const firstName = name.split(" ")[0];

    const results = await Promise.all(CARDS.map((c) => adminFetch(c.path, { fallback: null })));

    const hour = new Date().getHours();
    const greeting = hour < 6 ? "İyi geceler" : hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
    const today = new Date().toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "long",
    });

    const offline = results.every((r) => r.error);

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {/* Karşılama bandı */}
            <section className="ad-nav relative overflow-hidden rounded-2xl px-5 py-7 shadow-ad sm:px-8 sm:py-9">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-ad-brand/25 blur-[100px]"
                />
                <div className="relative">
                    <p className="text-xs font-medium tracking-wide text-ad-nav-text">{today}</p>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                        {greeting}, {firstName}
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-white/55">
                        Siteye yansıyan tüm içeriği, fiyatları ve seferleri buradan yönetebilirsiniz.
                    </p>
                </div>
            </section>

            {offline && (
                <p className="flex items-start gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 py-3 text-sm text-ad-brand-dark">
                    <Icon name="cloud_off" className="mt-px shrink-0 text-[18px]" />
                    <span>Sunucuya ulaşılamıyor. API çalışmıyor olabilir, sayılar güncel değil.</span>
                </p>
            )}

            {/* Sayım kartları */}
            <section>
                <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-ad-faint">İçerik özeti</h2>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {CARDS.map((card, i) => {
                        const { data, error } = results[i];
                        const list = asList(data);
                        const total = list?.length ?? null;
                        const active = list?.filter((x) => x.isActive !== false).length ?? null;
                        const passive = total != null && active != null ? total - active : 0;

                        return (
                            <Link
                                key={card.href}
                                href={card.href}
                                className="ad-card group relative overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-ad-brand-line hover:shadow-ad sm:p-5"
                            >
                                {/* Üst kenarda ince marka çizgisi, hover'da belirir */}
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-ad-brand to-ad-brand-dark transition-transform duration-300 group-hover:scale-x-100"
                                />

                                <div className="flex items-start justify-between gap-2">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ad-brand-soft text-ad-brand">
                                        <Icon name={card.icon} className="text-[21px]" />
                                    </span>
                                    <Icon
                                        name="arrow_outward"
                                        className="text-[18px] text-ad-faint transition-colors group-hover:text-ad-brand"
                                    />
                                </div>

                                <div className="mt-4 min-w-0">
                                    <div className="text-[28px] font-extrabold leading-none tracking-tight sm:text-[32px]">
                                        {error ? <span className="text-lg text-ad-faint">—</span> : total}
                                    </div>
                                    <div className="mt-2 truncate text-sm font-semibold text-ad-body">
                                        {card.label}
                                    </div>

                                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                        {error ? (
                                            <span className="text-xs text-ad-faint">Veri alınamadı</span>
                                        ) : (
                                            <>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-ad-ok-soft px-2 py-0.5 text-[11px] font-semibold text-ad-ok">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-ad-ok" />
                                                    {active} yayında
                                                </span>
                                                {passive > 0 && (
                                                    <span className="rounded-full bg-ad-sunken px-2 py-0.5 text-[11px] font-semibold text-ad-muted">
                                                        {passive} pasif
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Kısayollar */}
            <section>
                <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-ad-faint">Hızlı işlemler</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {SHORTCUTS.map((s) => (
                        <Link
                            key={s.href}
                            href={s.href}
                            className="ad-card group flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-ad-brand-line hover:shadow-ad"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ad-sunken text-ad-brand transition-colors group-hover:bg-ad-brand-soft">
                                <Icon name={s.icon} className="text-[20px]" />
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold">{s.label}</span>
                                <span className="block truncate text-xs text-ad-muted">{s.sub}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}