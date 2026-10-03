"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ToursGrid from "@/components/sections/ToursGrid";
import Icon from "@/components/ui/Icon";
import { dailyTours, TOURS_PER_PAGE } from "@/lib/mockData";

/* Hero arka plan görseli */
const HERO_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkwDqEPAeNrXqPgnoM6WRcK8XCRH0Vq5mqeVcJJAKWlTbXr7zzeeFtGjpbIo8aavqAeyDGi_Lrf5-4eM-6Lc9fv4lomoh_Gb_ThEDM7Hk3Tcg83OfBi4A7D_d3pYTl8pW1UJxD4iY4oijFSbodCQYdKpY-sYBZ70gD1qCFW_dHKf6VeeNONLjdxOWkB90nI0XJg_VBS3upPnWWxFfvmD9SfexSHwEC2pxg8V6VFaMdMeBhTnAtu_u2zQ";

const SORT_OPTIONS = [
    { value: "popular", label: "En Popüler", icon: "trending_up" },
    { value: "price-asc", label: "En Düşük Fiyat", icon: "south" },
    { value: "price-desc", label: "En Yüksek Fiyat", icon: "north" },
    { value: "rating", label: "Müşteri Puanı", icon: "star" },
];

const PRICE_PRESETS = [
    { label: "₺1.000 altı", min: "", max: "1000" },
    { label: "₺1.000 – ₺2.000", min: "1000", max: "2000" },
    { label: "₺2.000 üzeri", min: "2000", max: "" },
];

const EMPTY_PRICE = { min: "", max: "" };

/* ───────── Yardımcılar ───────── */
const norm = (s) =>
    String(s)
        .toLocaleLowerCase("tr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .trim();

const SKIP_KEYS = /image|img|src|url|slug|href|icon/i;
const matchesQuery = (tour, q) => {
    if (!q) return true;
    const text = Object.entries(tour)
        .filter(([k, v]) => typeof v === "string" && !SKIP_KEYS.test(k))
        .map(([, v]) => v)
        .join(" ");
    return norm(text).includes(q);
};

const priceOf = (t) => parseInt(String(t.price).replace(/\D/g, ""), 10) || 0;
const fmt = (n) => Number(n).toLocaleString("tr-TR");

const priceLabel = ({ min, max }) =>
    min && max ? `₺${fmt(min)} – ₺${fmt(max)}` : min ? `₺${fmt(min)} ve üzeri` : max ? `₺${fmt(max)} altı` : "";

const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const inDays = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
};
const dateLabel = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });

/* Turda `dates: ["2026-10-12"]` veya `days: [1,3,5]` (0=Pazar) varsa ona bakar,
   hiçbiri yoksa tur her gün kalkıyor sayılır. */
const availableOn = (tour, iso) => {
    if (!iso) return true;
    if (tour.dates?.length) return tour.dates.includes(iso);
    if (tour.days?.length) return tour.days.includes(new Date(`${iso}T00:00:00`).getDay());
    return true;
};

/* ───────── Sayfa ───────── */
export default function DailyToursPage() {
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("popular");
    const [price, setPrice] = useState(EMPTY_PRICE);
    const [date, setDate] = useState("");
    const catalogRef = useRef(null);

    const hasPrice = Boolean(price.min || price.max);
    const hasFilters = Boolean(query.trim() || hasPrice || date);

    const clearAll = () => {
        setQuery("");
        setPrice(EMPTY_PRICE);
        setDate("");
    };

    const visibleTours = useMemo(() => {
        const q = norm(query);
        let lo = price.min ? Number(price.min) : null;
        let hi = price.max ? Number(price.max) : null;
        if (lo !== null && hi !== null && lo > hi) [lo, hi] = [hi, lo];

        const arr = dailyTours.filter((t) => {
            const p = priceOf(t);
            return (
                matchesQuery(t, q) &&
                (lo === null || p >= lo) &&
                (hi === null || p <= hi) &&
                availableOn(t, date)
            );
        });

        if (sortBy === "price-asc") arr.sort((a, b) => priceOf(a) - priceOf(b));
        else if (sortBy === "price-desc") arr.sort((a, b) => priceOf(b) - priceOf(a));
        else if (sortBy === "rating") arr.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        return arr;
    }, [query, price, date, sortBy]);

    const scrollToCatalog = () =>
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const onSearch = (e) => {
        e.preventDefault();
        scrollToCatalog();
    };

    return (
        <>
            {/* HERO */}
            <section className="relative w-full px-margin pb-16 pt-4 md:px-margin-tablet lg:px-margin-desktop">
                <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-charcoal-dark shadow-2xl">
                    <div
                        className="absolute inset-0 scale-105 bg-cover bg-center transition-transform duration-1000"
                        style={{ backgroundImage: `url('${HERO_BG}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/60 to-charcoal-dark/30" />
                    <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary-container/20 blur-3xl" />

                    <div className="relative z-10 flex max-w-3xl flex-col items-start gap-4 px-6 pb-24 pt-14 text-surface-white md:px-10 md:pb-28 md:pt-20">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md">
                            <Icon name="eco" fill className="text-[16px] text-crimson-vivid" />
                            <span>Karadeniz'in Eşsiz Doğasını Keşfedin</span>
                        </div>

                        <h1 className="font-display-hero-mobile text-display-hero-mobile font-extrabold uppercase leading-tight tracking-tight text-surface-white md:font-display-hero md:text-display-hero">
                            Günübirlik Karadeniz Keşifleri & Turlar
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 pt-2 font-label-md text-label-md text-surface-white/90">
                            <span className="flex items-center gap-1.5">
                                <Icon name="verified" fill className="text-[18px] text-crimson-vivid" />
                                TÜRSAB A Grubu Lisanslı
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Icon name="directions_bus" fill className="text-[18px] text-crimson-vivid" />
                                Mercedes Vito & Sprinter
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Icon name="event_available" fill className="text-[18px] text-crimson-vivid" />
                                Her Gün Kesin Kalkış
                            </span>
                        </div>
                    </div>
                </div>

                {/* FLOATING SEARCH BAR */}
                <div className="relative z-20 mx-auto -mt-10 w-full max-w-5xl px-4 md:-mt-12">
                    <form
                        role="search"
                        onSubmit={onSearch}
                        className="flex flex-col items-stretch gap-2 rounded-2xl border border-surface-variant bg-surface-white p-3 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.12)] md:flex-row md:items-center md:rounded-full md:p-3.5"
                    >
                        <div className="flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-canvas-offwhite md:rounded-full">
                            <Icon name="search" className="text-[22px] text-crimson-vivid" />
                            <input
                                type="text"
                                aria-label="Tur ara"
                                placeholder="Tur veya bölge ara: Uzungöl, Ayder, Sümela..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-transparent font-body-md text-body-md text-charcoal-dark placeholder:text-secondary/60 focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    aria-label="Aramayı temizle"
                                    onClick={() => setQuery("")}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-variant hover:text-charcoal-dark"
                                >
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-xl bg-primary-container px-8 py-4 font-headline-sm text-headline-sm font-bold text-on-primary shadow-[0_4px_18px_-2px_rgba(187,0,38,0.4)] transition-all hover:bg-crimson-vivid active:scale-95 md:rounded-full"
                        >
                            <Icon name="search" className="text-[20px]" />
                            <span>Turları Ara</span>
                        </button>
                    </form>
                </div>
            </section>

            {/* MAIN CATALOG */}
            <section
                ref={catalogRef}
                className="mx-auto w-full max-w-7xl scroll-mt-24 px-margin pb-20 md:px-margin-tablet lg:px-margin-desktop"
            >
                {/* SONUÇ + FİLTRE + SIRALAMA */}
                <div className="mb-8 flex flex-col gap-4 border-b border-surface-variant pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-1.5">
                        <span className="flex items-center gap-2 font-label-uppercase text-label-uppercase text-crimson-vivid">
                            <span className="inline-block h-[2px] w-5 bg-crimson-vivid" />
                            Günübirlik Turlar
                        </span>
                        <h2 className="font-headline-md text-headline-md text-charcoal-dark">
                            {visibleTours.length}{" "}
                            <span className="font-semibold text-secondary">tur listeleniyor</span>
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <PriceFilter value={price} onChange={setPrice} />
                        <DateFilter value={date} onChange={setDate} />
                        <SortMenu value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
                    </div>
                </div>

                {/* AKTİF FİLTRELER */}
                {hasFilters && (
                    <div className="-mt-3 mb-8 flex flex-wrap items-center gap-2">
                        {query.trim() && <FilterChip label={`“${query.trim()}”`} onRemove={() => setQuery("")} />}
                        {hasPrice && <FilterChip label={priceLabel(price)} onRemove={() => setPrice(EMPTY_PRICE)} />}
                        {date && <FilterChip label={dateLabel(date)} onRemove={() => setDate("")} />}
                        <button
                            type="button"
                            onClick={clearAll}
                            className="font-label-sm text-label-sm font-semibold text-crimson-vivid underline-offset-4 hover:underline"
                        >
                            Tümünü temizle
                        </button>
                    </div>
                )}

                {/* GRID */}
                {visibleTours.length > 0 ? (
                    <ToursGrid
                        key={`${norm(query)}|${sortBy}|${price.min}|${price.max}|${date}`}
                        tours={visibleTours}
                        variant="daily"
                        perPage={TOURS_PER_PAGE}
                        onPageChange={scrollToCatalog}
                    />
                ) : (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-white px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-offwhite">
                            <Icon name="search_off" className="text-[28px] text-crimson-vivid" />
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-charcoal-dark">
                            Aramanıza uygun tur bulunamadı
                        </h3>
                        <p className="max-w-md font-body-sm text-body-sm text-secondary">
                            Filtreleri değiştirmeyi ya da temizleyerek tüm turları görüntülemeyi deneyin.
                        </p>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="mt-2 bg-charcoal-dark px-6 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                        >
                            Tüm Turları Göster
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}

/* ─────────────────────────────────────────────
   ORTAK PARÇALAR
   ───────────────────────────────────────────── */
function useDismiss(open, setOpen) {
    const ref = useRef(null);
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, setOpen]);
    return ref;
}

function Trigger({ icon, label, value, open, active, onClick, popup, className = "" }) {
    return (
        <button
            type="button"
            aria-haspopup={popup}
            aria-expanded={open}
            onClick={onClick}
            className={`flex items-center justify-between gap-3 rounded-xl border bg-surface-white px-4 py-2.5 text-left shadow-sm transition-colors ${open || active ? "border-crimson-vivid" : "border-surface-variant hover:border-secondary/40"
                } ${className}`}
        >
            <span className="flex items-center gap-3">
                <Icon name={icon} className="text-[20px] text-crimson-vivid" />
                <span className="flex flex-col leading-tight">
                    <span className="font-label-uppercase text-label-uppercase text-secondary">{label}</span>
                    <span className="max-w-[150px] truncate font-label-md text-label-md font-semibold text-charcoal-dark">
                        {value}
                    </span>
                </span>
            </span>
            <Icon
                name="expand_more"
                className={`text-[20px] text-secondary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
        </button>
    );
}

const POPOVER_CLASS =
    "absolute top-full z-30 mt-2 rounded-xl border border-surface-variant bg-surface-white shadow-[0_12px_32px_-8px_rgba(15,17,21,0.18)]";
const POPOVER_ANIM = {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: { duration: 0.15 },
};

function Pill({ selected, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-3 py-1 font-label-sm text-label-sm transition-colors ${selected
                ? "border-crimson-vivid bg-crimson-vivid/10 font-semibold text-crimson-vivid"
                : "border-surface-variant text-charcoal-dark hover:border-crimson-vivid"
                }`}
        >
            {children}
        </button>
    );
}

function FilterChip({ label, onRemove }) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="group inline-flex items-center gap-1.5 rounded-full border border-surface-variant bg-canvas-offwhite py-1 pl-3 pr-2 font-label-sm text-label-sm text-charcoal-dark transition-colors hover:border-crimson-vivid"
        >
            <span className="max-w-[180px] truncate">{label}</span>
            <Icon name="close" className="text-[14px] text-secondary group-hover:text-crimson-vivid" />
        </button>
    );
}

/* Filtre popover'ı: tetik + panel + Temizle/Tamam */
function FilterPopover({ label, icon, valueLabel, active, align = "left", onClear, children }) {
    const [open, setOpen] = useState(false);
    const ref = useDismiss(open, setOpen);

    return (
        <div ref={ref} className="relative">
            <Trigger
                icon={icon}
                label={label}
                value={valueLabel}
                open={open}
                active={active}
                popup="dialog"
                onClick={() => setOpen((v) => !v)}
            />
            <AnimatePresence>
                {open && (
                    <motion.div
                        role="dialog"
                        aria-label={label}
                        {...POPOVER_ANIM}
                        className={`${POPOVER_CLASS} w-[min(320px,calc(100vw-2rem))] p-4 ${align === "right" ? "right-0" : "left-0"}`}
                    >
                        {children}
                        <div className="mt-4 flex items-center justify-between border-t border-surface-variant pt-3">
                            <button
                                type="button"
                                onClick={onClear}
                                disabled={!active}
                                className="font-label-sm text-label-sm font-semibold text-secondary transition-colors enabled:hover:text-crimson-vivid disabled:opacity-40"
                            >
                                Temizle
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="bg-charcoal-dark px-5 py-2 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                            >
                                Tamam
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─────────────────────────────────────────────
   FİLTRELER
   ───────────────────────────────────────────── */
function PriceFilter({ value, onChange }) {
    const active = Boolean(value.min || value.max);
    const setField = (key) => (e) =>
        onChange({ ...value, [key]: e.target.value.replace(/\D/g, "").slice(0, 6) });

    return (
        <FilterPopover
            label="Fiyat"
            icon="payments"
            active={active}
            valueLabel={active ? priceLabel(value) : "Tümü"}
            onClear={() => onChange(EMPTY_PRICE)}
        >
            <div className="grid grid-cols-2 gap-3">
                {[
                    { key: "min", text: "En az", ph: "0" },
                    { key: "max", text: "En çok", ph: "Sınırsız" },
                ].map((f) => (
                    <label
                        key={f.key}
                        className="flex flex-col gap-1 rounded-lg border border-surface-variant bg-canvas-offwhite px-3 py-2 focus-within:border-crimson-vivid"
                    >
                        <span className="font-label-uppercase text-label-uppercase text-secondary">{f.text}</span>
                        <span className="flex items-center gap-1">
                            <span className="font-label-md text-label-md text-secondary">₺</span>
                            <input
                                inputMode="numeric"
                                placeholder={f.ph}
                                value={value[f.key]}
                                onChange={setField(f.key)}
                                className="w-full bg-transparent font-label-md text-label-md font-semibold text-charcoal-dark placeholder:font-normal placeholder:text-secondary/50 focus:outline-none"
                            />
                        </span>
                    </label>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {PRICE_PRESETS.map((p) => (
                    <Pill
                        key={p.label}
                        selected={value.min === p.min && value.max === p.max}
                        onClick={() => onChange({ min: p.min, max: p.max })}
                    >
                        {p.label}
                    </Pill>
                ))}
            </div>
        </FilterPopover>
    );
}

function DateFilter({ value, onChange }) {
    const [quick, setQuick] = useState([]);

    /* Tarihler client'ta hesaplanır (hydration uyumsuzluğu olmasın) */
    useEffect(() => {
        const satOffset = (6 - new Date().getDay() + 7) % 7;
        setQuick([
            { label: "Bugün", iso: toISO(inDays(0)) },
            { label: "Yarın", iso: toISO(inDays(1)) },
            { label: "Hafta sonu", iso: toISO(inDays(satOffset)) },
        ]);
    }, []);

    return (
        <FilterPopover
            label="Tarih"
            icon="calendar_month"
            align="right"
            active={Boolean(value)}
            valueLabel={value ? dateLabel(value) : "Tüm tarihler"}
            onClear={() => onChange("")}
        >
            <label className="flex flex-col gap-1 rounded-lg border border-surface-variant bg-canvas-offwhite px-3 py-2 focus-within:border-crimson-vivid">
                <span className="font-label-uppercase text-label-uppercase text-secondary">Kalkış tarihi</span>
                <input
                    type="date"
                    min={quick[0]?.iso}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full cursor-pointer bg-transparent font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none"
                />
            </label>

            <div className="mt-3 flex flex-wrap gap-2">
                {quick.map((q) => (
                    <Pill key={q.label} selected={value === q.iso} onClick={() => onChange(q.iso)}>
                        {q.label}
                    </Pill>
                ))}
            </div>
        </FilterPopover>
    );
}

/* ─────────────────────────────────────────────
   SIRALAMA MENÜSÜ
   ───────────────────────────────────────────── */
function SortMenu({ value, onChange, options }) {
    const [open, setOpen] = useState(false);
    const ref = useDismiss(open, setOpen);
    const current = options.find((o) => o.value === value) ?? options[0];

    return (
        <div ref={ref} className="relative">
            <Trigger
                icon="swap_vert"
                label="Sırala"
                value={current.label}
                open={open}
                popup="listbox"
                onClick={() => setOpen((v) => !v)}
                className="sm:min-w-[210px]"
            />

            <AnimatePresence>
                {open && (
                    <motion.ul
                        role="listbox"
                        {...POPOVER_ANIM}
                        className={`${POPOVER_CLASS} right-0 w-full min-w-[220px] overflow-hidden py-1.5`}
                    >
                        {options.map((o) => {
                            const selected = o.value === value;
                            return (
                                <li key={o.value} role="option" aria-selected={selected}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onChange(o.value);
                                            setOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-label-md text-label-md transition-colors hover:bg-canvas-offwhite ${selected ? "font-semibold text-crimson-vivid" : "text-charcoal-dark"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon
                                                name={o.icon}
                                                className={`text-[18px] ${selected ? "text-crimson-vivid" : "text-secondary"}`}
                                            />
                                            {o.label}
                                        </span>
                                        {selected && <Icon name="check" className="text-[18px]" />}
                                    </button>
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}