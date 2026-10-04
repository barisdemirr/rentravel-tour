"use client";

import { useMemo, useRef, useState } from "react";
import TourCard from "@/components/cards/TourCard";
import Icon from "@/components/ui/Icon";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";

const PAGE_SIZE = 12;
const EMPTY_PRICE = { min: "", max: "" };

/* Hero arka plan görseli */
const HERO_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkwDqEPAeNrXqPgnoM6WRcK8XCRH0Vq5mqeVcJJAKWlTbXr7zzeeFtGjpbIo8aavqAeyDGi_Lrf5-4eM-6Lc9fv4lomoh_Gb_ThEDM7Hk3Tcg83OfBi4A7D_d3pYTl8pW1UJxD4iY4oijFSbodCQYdKpY-sYBZ70gD1qCFW_dHKf6VeeNONLjdxOWkB90nI0XJg_VBS3upPnWWxFfvmD9SfexSHwEC2pxg8V6VFaMdMeBhTnAtu_u2zQ";

/* Arama için: küçük harf, aksan ve Türkçe i/ı farkı yok sayılır */
const norm = (s) =>
    String(s ?? "")
        .toLocaleLowerCase("tr")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ı/g, "i")
        .trim();

const fieldCls =
    "w-full rounded-xl bg-canvas-offwhite px-4 py-3 font-label-md text-label-md font-semibold text-charcoal-dark outline-none transition-all focus:ring-2 focus:ring-crimson-vivid/30";

export default function DailyToursClient({ tours = [], categories = [], failed = false }) {
    const { t, tpl, locale } = useLanguage();
    const l = t.dailyList;
    const catalogRef = useRef(null);

    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [price, setPrice] = useState(EMPTY_PRICE);
    const [priceOpen, setPriceOpen] = useState(false);

    const money = (amount) => formatPrice(amount, "TRY", locale);
    const hasPrice = Boolean(price.min || price.max);
    const hasFilters = Boolean(query.trim() || category !== "all" || hasPrice);

    const priceText = () => {
        if (price.min && price.max) return `${money(price.min)} – ${money(price.max)}`;
        if (price.min) return tpl(l.priceFrom, { price: money(price.min) });
        if (price.max) return tpl(l.priceTo, { price: money(price.max) });
        return l.priceAll;
    };

    const clearAll = () => {
        setQuery("");
        setCategory("all");
        setPrice(EMPTY_PRICE);
    };

    /* Kategori sekmeleri: sadece içinde tur olanlar */
    const tabs = useMemo(
        () =>
            categories
                .map((c) => ({ ...c, count: tours.filter((x) => x.category?.key === c.key).length }))
                .filter((c) => c.count > 0),
        [categories, tours]
    );

    const visible = useMemo(() => {
        const q = norm(query);
        let lo = price.min ? Number(price.min) : null;
        let hi = price.max ? Number(price.max) : null;
        if (lo !== null && hi !== null && lo > hi) [lo, hi] = [hi, lo];

        const list = tours.filter((tour) => {
            const p = Number(tour.defaultBasePrice) || 0;
            if (category !== "all" && tour.category?.key !== category) return false;
            if (lo !== null && p < lo) return false;
            if (hi !== null && p > hi) return false;
            if (!q) return true;

            const text = [
                localized(tour.title, locale),
                localized(tour.description, locale),
                localized(tour.transport, locale),
                localized(tour.category?.label, locale),
            ].join(" ");
            return norm(text).includes(q);
        });

        if (sortBy === "price-asc") list.sort((a, b) => a.defaultBasePrice - b.defaultBasePrice);
        else if (sortBy === "price-desc") list.sort((a, b) => b.defaultBasePrice - a.defaultBasePrice);
        return list; // "popular": backend sırası (orderIndex)
    }, [tours, query, category, price, sortBy, locale]);

    const scrollToCatalog = () =>
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const setPriceField = (key) => (e) =>
        setPrice((p) => ({ ...p, [key]: e.target.value.replace(/\D/g, "").slice(0, 6) }));

    return (
        <>
            {/* HERO */}
            <section className="relative w-full px-margin pb-14 pt-4 md:px-margin-tablet lg:px-margin-desktop">
                <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl bg-charcoal-dark shadow-2xl">
                    <div
                        className="absolute inset-0 scale-105 bg-cover bg-center"
                        style={{ backgroundImage: `url('${HERO_BG}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/60 to-charcoal-dark/30" />
                    <div className="pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full bg-primary-container/20 blur-3xl" />

                    <div className="relative z-10 flex max-w-3xl flex-col items-start gap-4 px-5 pb-20 pt-10 text-surface-white sm:px-6 md:px-10 md:pb-28 md:pt-20">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-md">
                            <Icon name="eco" fill className="text-[16px] text-crimson-vivid" />
                            <span>{l.heroBadge}</span>
                        </div>

                        <h1 className="break-words font-display-hero-mobile text-display-hero-mobile font-extrabold uppercase leading-tight tracking-tight text-surface-white md:font-display-hero md:text-display-hero">
                            {l.heroTitle}
                        </h1>

                        <div className="flex flex-col gap-2 pt-1 font-label-md text-label-md text-surface-white/90 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                            {[
                                { icon: "verified", text: l.trust1 },
                                { icon: "directions_bus", text: l.trust2 },
                                { icon: "event_available", text: l.trust3 },
                            ].map((item) => (
                                <span key={item.icon} className="flex items-center gap-1.5">
                                    <Icon name={item.icon} fill className="text-[18px] text-crimson-vivid" />
                                    {item.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ARAMA ÇUBUĞU */}
                <div className="relative z-20 mx-auto -mt-10 w-full max-w-5xl px-2 sm:px-4 md:-mt-12">
                    <form
                        role="search"
                        onSubmit={(e) => {
                            e.preventDefault();
                            scrollToCatalog();
                        }}
                        className="flex flex-col items-stretch gap-2 rounded-2xl border border-surface-variant bg-surface-white p-2.5 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.12)] md:flex-row md:items-center md:rounded-full md:p-3.5"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-canvas-offwhite md:rounded-full md:px-4 md:py-3">
                            <Icon name="search" className="shrink-0 text-[22px] text-crimson-vivid" />
                            <input
                                type="search"
                                aria-label={l.searchLabel}
                                placeholder={l.searchPlaceholder}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full min-w-0 bg-transparent font-body-md text-body-md text-charcoal-dark placeholder:text-secondary/60 focus:outline-none"
                            />
                            {query && (
                                <button
                                    type="button"
                                    aria-label={l.clearSearch}
                                    onClick={() => setQuery("")}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:bg-surface-variant hover:text-charcoal-dark"
                                >
                                    <Icon name="close" className="text-[18px]" />
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="flex items-center justify-center gap-2 rounded-xl bg-primary-container px-8 py-3.5 font-headline-sm text-headline-sm font-bold text-on-primary shadow-[0_4px_18px_-2px_rgba(187,0,38,0.4)] transition-all hover:bg-crimson-vivid active:scale-95 md:rounded-full md:py-4"
                        >
                            <Icon name="search" className="text-[20px]" />
                            <span>{l.searchButton}</span>
                        </button>
                    </form>
                </div>
            </section>

            {/* KATALOG */}
            <section
                ref={catalogRef}
                className="mx-auto w-full max-w-7xl scroll-mt-24 px-margin pb-20 md:px-margin-tablet lg:px-margin-desktop"
            >
                {/* Başlık + sonuç sayısı */}
                <div className="mb-4 flex flex-col gap-1.5">
                    <span className="flex items-center gap-2 font-label-uppercase text-label-uppercase text-crimson-vivid">
                        <span className="inline-block h-[2px] w-5 bg-crimson-vivid" />
                        {l.eyebrow}
                    </span>
                    <h2 className="font-headline-md text-headline-md font-semibold text-secondary">
                        {tpl(l.count, { count: visible.length })}
                    </h2>
                </div>

                {/* Kategori sekmeleri (yatay kaydırılır) */}
                {tabs.length > 0 && (
                    <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                        {[{ key: "all", label: null }, ...tabs].map((c) => {
                            const selected = category === c.key;
                            return (
                                <button
                                    key={c.key}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setCategory(c.key)}
                                    className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 font-label-md text-label-md font-semibold transition-colors ${selected
                                        ? "border-crimson-vivid bg-crimson-vivid text-on-primary"
                                        : "border-surface-variant bg-surface-white text-charcoal-dark hover:border-crimson-vivid"
                                        }`}
                                >
                                    {c.icon && <Icon name={c.icon} className="text-[16px]" />}
                                    {c.key === "all" ? l.allCategories : localized(c.label, locale)}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Sıralama + fiyat */}
                <div className="mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                    <label className="relative block sm:min-w-[210px]">
                        <span className="sr-only">{l.sortLabel}</span>
                        <Icon
                            name="swap_vert"
                            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[20px] text-crimson-vivid"
                        />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full cursor-pointer appearance-none rounded-xl border border-surface-variant bg-surface-white py-3 ps-10 pe-9 font-label-md text-label-md font-semibold text-charcoal-dark shadow-sm focus:border-crimson-vivid focus:outline-none"
                        >
                            <option value="popular">{l.sortPopular}</option>
                            <option value="price-asc">{l.sortPriceAsc}</option>
                            <option value="price-desc">{l.sortPriceDesc}</option>
                        </select>
                        <Icon
                            name="expand_more"
                            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
                        />
                    </label>

                    <button
                        type="button"
                        aria-expanded={priceOpen}
                        onClick={() => setPriceOpen((v) => !v)}
                        className={`flex items-center justify-between gap-2 rounded-xl border bg-surface-white px-3 py-3 font-label-md text-label-md font-semibold text-charcoal-dark shadow-sm transition-colors sm:min-w-[210px] ${priceOpen || hasPrice ? "border-crimson-vivid" : "border-surface-variant"
                            }`}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <Icon name="payments" className="shrink-0 text-[20px] text-crimson-vivid" />
                            <span className="truncate">{hasPrice ? priceText() : l.priceLabel}</span>
                        </span>
                        <Icon
                            name="expand_more"
                            className={`shrink-0 text-[20px] text-secondary transition-transform ${priceOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>

                {/* Fiyat paneli: açılır kutu yerine sayfa içinde (telefonda taşma olmaz) */}
                {priceOpen && (
                    <div className="mb-4 rounded-2xl border border-surface-variant bg-surface-white p-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: "min", text: l.priceMin, ph: "0" },
                                { key: "max", text: l.priceMax, ph: l.priceUnlimited },
                            ].map((f) => (
                                <label key={f.key} className="flex flex-col gap-1">
                                    <span className="font-label-uppercase text-label-uppercase text-secondary">
                                        {f.text}
                                    </span>
                                    <span className="relative block">
                                        <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 font-label-md text-label-md text-secondary">
                                            ₺
                                        </span>
                                        <input
                                            inputMode="numeric"
                                            dir="ltr"
                                            placeholder={f.ph}
                                            value={price[f.key]}
                                            onChange={setPriceField(f.key)}
                                            className={`${fieldCls} ps-8 text-start`}
                                        />
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => setPrice(EMPTY_PRICE)}
                                disabled={!hasPrice}
                                className="font-label-md text-label-md font-semibold text-secondary transition-colors enabled:hover:text-crimson-vivid disabled:opacity-40"
                            >
                                {l.clear}
                            </button>
                        </div>
                    </div>
                )}

                {/* Aktif filtreler */}
                {hasFilters && (
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                        {query.trim() && <Chip label={`“${query.trim()}”`} onRemove={() => setQuery("")} />}
                        {category !== "all" && (
                            <Chip
                                label={localized(tabs.find((c) => c.key === category)?.label, locale)}
                                onRemove={() => setCategory("all")}
                            />
                        )}
                        {hasPrice && <Chip label={priceText()} onRemove={() => setPrice(EMPTY_PRICE)} />}
                        <button
                            type="button"
                            onClick={clearAll}
                            className="font-label-md text-label-md font-semibold text-crimson-vivid underline-offset-4 hover:underline"
                        >
                            {l.clearAll}
                        </button>
                    </div>
                )}

                {/* Liste */}
                {failed ? (
                    <Notice icon="cloud_off" title={l.loadError} />
                ) : visible.length > 0 ? (
                    <ResultsGrid
                        key={`${norm(query)}|${category}|${sortBy}|${price.min}|${price.max}`}
                        tours={visible}
                        onMore={scrollToCatalog}
                    />
                ) : (
                    <Notice icon="search_off" title={l.emptyTitle} text={l.emptyText}>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="mt-2 rounded-xl bg-charcoal-dark px-6 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                        >
                            {l.emptyButton}
                        </button>
                    </Notice>
                )}
            </section>
        </>
    );
}

/* Sayfalama: filtre değişince key ile sıfırlanır */
function ResultsGrid({ tours }) {
    const { t, tpl } = useLanguage();
    const l = t.dailyList;
    const [limit, setLimit] = useState(PAGE_SIZE);
    const shown = tours.slice(0, limit);

    return (
        <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {shown.map((tour) => (
                    <TourCard key={tour.id} tour={tour} variant="daily" mode="grid" />
                ))}
            </div>

            {tours.length > limit && (
                <div className="mt-8 flex flex-col items-center gap-3">
                    <span className="font-body-sm text-body-sm text-secondary">
                        {tpl(l.shown, { shown: shown.length, total: tours.length })}
                    </span>
                    <button
                        type="button"
                        onClick={() => setLimit((n) => n + PAGE_SIZE)}
                        className="w-full rounded-xl bg-charcoal-dark px-8 py-3.5 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container sm:w-auto"
                    >
                        {l.loadMore}
                    </button>
                </div>
            )}
        </>
    );
}

function Chip({ label, onRemove }) {
    return (
        <button
            type="button"
            onClick={onRemove}
            className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-surface-variant bg-canvas-offwhite py-1.5 ps-3 pe-2 font-label-md text-label-md text-charcoal-dark transition-colors hover:border-crimson-vivid"
        >
            <span className="max-w-[200px] truncate">{label}</span>
            <Icon name="close" className="text-[14px] text-secondary group-hover:text-crimson-vivid" />
        </button>
    );
}

function Notice({ icon, title, text, children }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-white px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-offwhite">
                <Icon name={icon} className="text-[28px] text-crimson-vivid" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-charcoal-dark">{title}</h3>
            {text && <p className="max-w-md font-body-sm text-body-sm text-secondary">{text}</p>}
            {children}
        </div>
    );
}