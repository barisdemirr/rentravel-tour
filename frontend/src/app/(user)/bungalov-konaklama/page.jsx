"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SafeImage from "@/components/ui/SafeImage";
import RegionCarousel from "@/components/bungalows/RegionCarousel";
import BungalowCard from "@/components/bungalows/BungalowCard";
import {
    bungalows,
    BUNGALOW_REGIONS,
    BUNGALOW_SORT_OPTIONS,
    BUNGALOWS_PER_PAGE,
} from "@/lib/mockData";

/* Hero sağ taraftaki ana görsel */
const HERO_IMAGE =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAoaRM3QctDbMLTMvd85a4WGvULNJIBuhYV6AlbDU_BTZlblCgBilpSH4UmXMq9qFSRim4R2pWieSjg_hej58j_vKCPwLn_3MRN7BFdUdg1hwktaEG6cYf_2vQiKr_rL-047hTb5iZZY0iPzJm4Hl3bF5wGP7t54v-YdifjOHxvN3F53D3Bh-L_n0YILhS66dMzRId8CfKuHylA8MlYZ_JzvYAcxLECIHX6uVRxch4OKj6WiAof6wmmw";

/* ───────── Yardımcılar ───────── */
const todayISO = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

const plusDays = (iso, days) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
};

const priceOf = (b) =>
    parseInt(String(b.pricePerNight).replace(/\D/g, ""), 10) || 0;

const ratingOf = (b) => parseFloat(b.rating) || 0;

export default function BungalovKonaklamaPage() {
    /* Filtre state */
    const [region, setRegion] = useState(BUNGALOW_REGIONS[0].value);
    const [breakfastOnly, setBreakfastOnly] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [page, setPage] = useState(1);

    /* Hero form state */
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    const catalogRef = useRef(null);

    /* Tarihleri client'ta kur */
    useEffect(() => {
        const t = todayISO();
        setCheckIn(t);
        setCheckOut(plusDays(t, 3));
    }, []);

    /* Filtre + sıralama */
    const filteredBungalows = useMemo(() => {
        let arr = bungalows.filter((b) => b.region === region);
        if (breakfastOnly) arr = arr.filter((b) => b.breakfastIncluded);

        arr = [...arr];
        if (sortBy === "price-asc") arr.sort((a, b) => priceOf(a) - priceOf(b));
        else if (sortBy === "price-desc") arr.sort((a, b) => priceOf(b) - priceOf(a));
        else if (sortBy === "rating") arr.sort((a, b) => ratingOf(b) - ratingOf(a));
        return arr;
    }, [region, breakfastOnly, sortBy]);

    /* Pagination */
    const totalPages = Math.max(1, Math.ceil(filteredBungalows.length / BUNGALOWS_PER_PAGE));
    const safePage = Math.min(page, totalPages);
    const visibleBungalows = useMemo(() => {
        const start = (safePage - 1) * BUNGALOWS_PER_PAGE;
        return filteredBungalows.slice(start, start + BUNGALOWS_PER_PAGE);
    }, [filteredBungalows, safePage]);

    /* Filtre değişince sayfa 1'e dön */
    useEffect(() => {
        setPage(1);
    }, [region, breakfastOnly, sortBy]);

    /* Region değişince catalog'a scroll */
    const handleRegionChange = (next) => {
        setRegion(next);
    };

    const scrollToCatalog = () =>
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const onSearch = (e) => {
        e.preventDefault();
        scrollToCatalog();
    };

    /* Aktif bölgenin bungalovu — hero'daki floating badge için */
    const heroBungalow = useMemo(() => {
        const regionItems = bungalows.filter((b) => b.region === region);
        return regionItems[0] || bungalows[0];
    }, [region]);

    return (
        <>
            {/* ─────────── HERO ─────────── */}
            <section className="relative w-full overflow-hidden bg-charcoal-dark pb-16 pt-10 text-white md:pb-20">
                {/* Ambient glow */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[400px] w-[400px] rounded-full bg-crimson-vivid/15 blur-[120px] md:h-[600px] md:w-[600px]" />
                <div className="pointer-events-none absolute -bottom-40 right-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px] md:h-[500px] md:w-[500px]" />

                <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 md:px-8">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                        {/* SOL KOLON */}
                        <div className="flex flex-col items-start lg:col-span-7">
                            {/* Curated badge */}
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 shadow-sm backdrop-blur-md">
                                <span className="text-sm">🌲</span>
                                <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-rose-300">
                                    Çamlıhemşin & Fırtına Vadisi Koleksiyonu
                                </span>
                            </div>

                            {/* Başlık */}
                            <h1 className="mb-4 font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[52px]">
                                Betondan Uzak, Bulutların Arasında Masalsı Dağ Evleri.
                            </h1>

                            {/* Alt açıklama */}
                            <p className="mb-8 max-w-2xl font-body-md text-body-md font-light leading-relaxed text-slate-300 md:text-body-lg md:font-body-lg">
                                Çamlıhemşin'den Ayder'e; Fırtına Deresi kıyısında şömineli, özel havuzlu ve nehir manzaralı doğrulanmış lüks bungalov koleksiyonu.
                            </p>

                            {/* ARAMA BAR — mobil dikey, desktop yatay */}
                            <form
                                onSubmit={onSearch}
                                className="mb-6 w-full rounded-3xl border border-white/20 bg-surface-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:rounded-full lg:p-3"
                            >
                                <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center lg:gap-3">
                                    {/* Giriş tarihi */}
                                    <HeroField
                                        icon="calendar_month"
                                        label="Giriş"
                                        className="lg:w-[22%]"
                                    >
                                        <input
                                            type="date"
                                            value={checkIn}
                                            min={todayISO()}
                                            onChange={(e) => {
                                                setCheckIn(e.target.value);
                                                if (e.target.value > checkOut)
                                                    setCheckOut(plusDays(e.target.value, 3));
                                            }}
                                            className="w-full cursor-pointer bg-transparent font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none"
                                        />
                                    </HeroField>

                                    {/* Çıkış tarihi */}
                                    <HeroField
                                        icon="event"
                                        label="Çıkış"
                                        className="lg:w-[22%]"
                                    >
                                        <input
                                            type="date"
                                            value={checkOut}
                                            min={checkIn || todayISO()}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full cursor-pointer bg-transparent font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none"
                                        />
                                    </HeroField>

                                    {/* Yetişkin */}
                                    <HeroField
                                        icon="group"
                                        label="Yetişkin"
                                        className="lg:w-[15%]"
                                    >
                                        <input
                                            type="number"
                                            min="1"
                                            max="12"
                                            value={adults}
                                            onChange={(e) => setAdults(e.target.value)}
                                            className="w-full bg-transparent font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none"
                                        />
                                    </HeroField>

                                    {/* Çocuk */}
                                    <HeroField
                                        icon="child_care"
                                        label="Çocuk"
                                        className="lg:w-[15%]"
                                    >
                                        <input
                                            type="number"
                                            min="0"
                                            max="8"
                                            value={children}
                                            onChange={(e) => setChildren(e.target.value)}
                                            className="w-full bg-transparent font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none"
                                        />
                                    </HeroField>

                                    {/* CTA */}
                                    <div className="w-full lg:w-[20%]">
                                        <button
                                            type="submit"
                                            className="group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-container font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-[0_6px_20px_rgba(217,4,41,0.4)] transition-all hover:bg-crimson-vivid hover:scale-[1.02] active:scale-95 lg:rounded-full"
                                        >
                                            <Icon name="search" className="text-[18px]" />
                                            <span>Keşfet</span>
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Mikro garanti satırı */}
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-label-md text-label-md text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Icon name="check_circle" className="text-[14px] text-emerald-400" />
                                    %100 Doğrudan Tesis Kontratı
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Icon name="check_circle" className="text-[14px] text-emerald-400" />
                                    Serpme Köy Kahvaltısı Dahil Seçenekler
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Icon name="check_circle" className="text-[14px] text-emerald-400" />
                                    24 Saate Kadar Ücretsiz İptal
                                </span>
                            </div>
                        </div>

                        {/* SAĞ KOLON — Görsel */}
                        <div className="relative mt-4 lg:col-span-5 lg:mt-0">
                            <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:aspect-square">
                                <SafeImage
                                    src={HERO_IMAGE}
                                    alt="Fırtına Vadisi'nde sisler arasında lüks şömineli A-Frame dağ evi"
                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                {/* Floating glass badge */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-surface-white/90 p-3.5 shadow-xl backdrop-blur-md lg:bottom-5 lg:left-5 lg:right-5 lg:p-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-headline-sm text-headline-sm font-bold text-emerald-700 shadow-inner">
                                            ★ {heroBungalow.rating}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="truncate font-headline-sm text-headline-sm font-bold leading-tight text-charcoal-dark">
                                                {BUNGALOW_REGIONS.find((r) => r.value === region)?.shortLabel}
                                            </h4>
                                            <p className="truncate font-label-sm text-label-sm font-medium text-secondary">
                                                {heroBungalow.title}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="hidden shrink-0 rounded-full bg-emerald-100 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-emerald-800 sm:inline-flex">
                                        Öne Çıkan
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── REGION CAROUSEL ─────────── */}
            <section className="relative z-20 -mt-4 mx-auto w-full max-w-[1360px] px-4 md:-mt-6 md:px-8">
                <RegionCarousel value={region} onChange={handleRegionChange} />
            </section>

            {/* ─────────── FİLTRE KONSOLU ─────────── */}
            <section className="mx-auto w-full max-w-[1360px] px-4 pt-6 md:px-8">
                <div className="flex flex-col gap-4 rounded-2xl border border-surface-variant/70 bg-surface-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
                    {/* SOL — Kahvaltı toggle */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <label className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 transition-colors hover:bg-emerald-100/70">
                            <input
                                type="checkbox"
                                checked={breakfastOnly}
                                onChange={(e) => setBreakfastOnly(e.target.checked)}
                                className="sr-only"
                                aria-label="Sadece kahvaltı dahil olanlar"
                            />
                            <span
                                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${breakfastOnly ? "bg-emerald-600" : "bg-slate-300"
                                    }`}
                            >
                                <span
                                    className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${breakfastOnly ? "translate-x-4" : ""
                                        }`}
                                />
                            </span>
                            <span className="flex items-center gap-1 font-label-md text-label-md font-bold text-emerald-900">
                                <span>🍳</span>
                                Sadece Kahvaltı Dahil Olanlar
                            </span>
                        </label>
                    </div>

                    {/* SAĞ — Sıralama + sayaç */}
                    <div className="flex flex-col gap-3 border-t border-surface-variant/60 pt-3 sm:flex-row sm:items-center xl:border-t-0 xl:pt-0">
                        <span className="font-label-md text-label-md text-secondary">
                            <strong className="text-charcoal-dark">{filteredBungalows.length}</strong> bungalov
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="hidden font-label-md text-label-md text-secondary sm:inline">
                                Sırala:
                            </span>
                            <div className="relative flex-1 sm:w-56">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full cursor-pointer appearance-none rounded-full border border-surface-variant bg-canvas-offwhite px-4 py-2 pr-9 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                                >
                                    {BUNGALOW_SORT_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                                <Icon
                                    name="unfold_more"
                                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── BUNGALOV GRID ─────────── */}
            <section
                ref={catalogRef}
                className="mx-auto w-full max-w-[1360px] scroll-mt-24 px-4 py-8 md:px-8"
            >
                {visibleBungalows.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-white px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-offwhite">
                            <Icon name="search_off" className="text-[28px] text-crimson-vivid" />
                        </div>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                            Bu kriterlerde bungalov bulunamadı
                        </h3>
                        <p className="max-w-md font-body-sm text-body-sm text-secondary">
                            Farklı bir bölge seçmeyi veya kahvaltı filtresini kaldırmayı deneyin.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setRegion(BUNGALOW_REGIONS[0].value);
                                setBreakfastOnly(false);
                            }}
                            className="mt-2 rounded-full bg-charcoal-dark px-6 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                        >
                            Filtreleri Temizle
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {visibleBungalows.map((b) => (
                                <motion.div
                                    key={b.id}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <BungalowCard bungalow={b} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-12 flex flex-col items-center gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setPage(safePage - 1);
                                    scrollToCatalog();
                                }}
                                disabled={safePage === 1}
                                aria-label="Önceki sayfa"
                                className="flex items-center gap-1 rounded-full border border-surface-variant bg-surface-white px-4 py-2 font-label-md text-label-md font-semibold text-secondary shadow-sm transition-colors hover:border-crimson-vivid hover:text-crimson-vivid disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-surface-variant disabled:hover:text-secondary"
                            >
                                <Icon name="arrow_back" className="text-[16px]" />
                                <span className="hidden sm:inline">Önceki</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                                    const isActive = n === safePage;
                                    return (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => {
                                                setPage(n);
                                                scrollToCatalog();
                                            }}
                                            aria-current={isActive ? "page" : undefined}
                                            className={`flex h-9 w-9 items-center justify-center rounded-full font-headline-sm text-headline-sm font-bold transition-all ${isActive
                                                    ? "bg-primary-container text-on-primary shadow-md shadow-primary-container/25"
                                                    : "border border-surface-variant bg-surface-white text-charcoal-dark hover:border-crimson-vivid hover:text-crimson-vivid"
                                                }`}
                                        >
                                            {n}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setPage(safePage + 1);
                                    scrollToCatalog();
                                }}
                                disabled={safePage === totalPages}
                                aria-label="Sonraki sayfa"
                                className="flex items-center gap-1 rounded-full border border-surface-variant bg-surface-white px-4 py-2 font-label-md text-label-md font-semibold text-secondary shadow-sm transition-colors hover:border-crimson-vivid hover:text-crimson-vivid disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-surface-variant disabled:hover:text-secondary"
                            >
                                <span className="hidden sm:inline">Sonraki</span>
                                <Icon name="arrow_forward" className="text-[16px]" />
                            </button>
                        </div>

                        <span className="font-body-sm text-body-sm text-secondary">
                            Toplam{" "}
                            <strong className="text-charcoal-dark">{filteredBungalows.length}</strong>{" "}
                            bungalovdan{" "}
                            <strong className="text-charcoal-dark">
                                {(safePage - 1) * BUNGALOWS_PER_PAGE + 1} -{" "}
                                {Math.min(safePage * BUNGALOWS_PER_PAGE, filteredBungalows.length)}
                            </strong>{" "}
                            arası listeleniyor
                        </span>
                    </div>
                )}
            </section>

            {/* ─────────── VADİ AYRICALIKLARI ─────────── */}
            <section className="relative w-full overflow-hidden bg-charcoal-dark py-16 text-white md:py-20">
                <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 md:px-8">
                    <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center md:mb-14">
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 font-label-uppercase text-label-uppercase font-bold tracking-widest text-rose-300 backdrop-blur-md">
                            Rentravel Deneyimi
                        </span>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                            Bungalov Konaklamasında Rentravel Vadi Ayrıcalıkları
                        </h2>
                        <p className="mt-3 max-w-2xl font-body-md text-body-md font-light text-slate-400">
                            Doğu Karadeniz'in zorlu vadilerinde sürprize yer yok. Rezervasyondan anahtar teslimine kadar her an yanınızdayız.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <PillarCard
                            icon="local_fire_department"
                            tone="crimson"
                            title="Kesintisiz Odun & Şömine Desteği"
                            text="Konaklamanız boyunca çıtır çıtır yanan kuru meşe şömine odunları kapınıza kadar limitsiz teslim edilir."
                        />
                        <PillarCard
                            icon="bakery_dining"
                            tone="emerald"
                            title="Tescilli Organik Yayla Kahvaltısı"
                            text="Yerel üreticilerden temin edilen taze kuymak/muhlama, yayla tereyağı ve petek balı ile güne taze başlayın."
                        />
                        <PillarCard
                            icon="directions_car"
                            tone="crimson"
                            title="4x4 Vadi & Havalimanı Transferi"
                            text="Yüksek yayla ve vadi yollarına uygun 4x4 araç filomuzla Rize-Artvin & Trabzon Havalimanı kapıdan kapıya transfer."
                        />
                        <PillarCard
                            icon="verified_user"
                            tone="amber"
                            title="TÜRSAB 15869 Resmi Güvencesi"
                            text="A Grubu Resmi Seyahat Acentası güvencesiyle sıfır aracı komisyonu, teyitli tesis sözleşmesi ve 7/24 vadi desteği."
                        />
                    </div>
                </div>
            </section>

            {/* ─────────── VIP CALLOUT ─────────── */}
            <section className="mx-auto w-full max-w-[1360px] px-4 py-16 md:px-8 md:py-20">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-charcoal-dark via-[#1a1e27] to-charcoal-dark p-6 text-white shadow-2xl md:p-12">
                    <div className="pointer-events-none absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-crimson-vivid/20 blur-3xl" />
                    <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
                        <div className="max-w-2xl text-center lg:text-left">
                            <span className="mb-2 block font-label-uppercase text-label-uppercase font-bold tracking-widest text-crimson-vivid">
                                Özel Organizasyonlar
                            </span>
                            <h3 className="mb-3 font-headline-md text-headline-md font-extrabold text-white md:font-headline-lg md:text-headline-lg">
                                Balayı veya Kalabalık Aile Konaklaması mı Planlıyorsunuz?
                            </h3>
                            <p className="font-body-sm text-body-sm font-light leading-relaxed text-slate-300">
                                Varış saatinize göre jakuzi ısıtma, şömine hazırlığı, canlı çiçek süslemesi ve organik lezzet sepetleri için VIP bölge uzmanlarımız bir tık uzağınızda.
                            </p>
                        </div>

                        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                            <a
                                href="https://wa.me/908503096100"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-lg transition-all hover:bg-emerald-500 sm:w-auto"
                            >
                                <Icon name="chat" className="text-[18px]" />
                                <span>WhatsApp VIP Danışman</span>
                            </a>
                            <a
                                href="tel:08503096100"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto"
                            >
                                <Icon name="call" className="text-[18px]" />
                                <span>0850 309 61 00</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

function HeroField({ icon, label, children, className = "" }) {
    return (
        <div
            className={`flex items-center gap-2 rounded-2xl bg-canvas-offwhite px-4 py-2 transition-colors hover:bg-surface-variant/60 lg:rounded-full ${className}`}
        >
            <Icon name={icon} className="shrink-0 text-[18px] text-crimson-vivid" />
            <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="font-label-uppercase text-label-uppercase font-bold text-secondary leading-none">
                    {label}
                </span>
                <div className="mt-0.5">{children}</div>
            </div>
        </div>
    );
}

const PILLAR_TONES = {
    crimson: { bg: "bg-crimson-vivid/15", fg: "text-crimson-vivid" },
    emerald: { bg: "bg-emerald-500/15", fg: "text-emerald-400" },
    amber: { bg: "bg-amber-500/15", fg: "text-amber-400" },
};

function PillarCard({ icon, tone, title, text }) {
    const t = PILLAR_TONES[tone] || PILLAR_TONES.crimson;
    return (
        <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:bg-white/10">
            <div
                className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${t.bg} ${t.fg} transition-transform group-hover:scale-110`}
            >
                <Icon name={icon} className="text-[28px]" />
            </div>
            <h3 className="mb-2 font-headline-sm text-headline-sm font-bold text-white">
                {title}
            </h3>
            <p className="font-body-sm text-body-sm font-light leading-relaxed text-slate-400">
                {text}
            </p>
        </div>
    );
}