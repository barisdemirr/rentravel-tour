"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BungalowCard from "@/components/cards/BungalowCard";
import TiltCard from "@/components/bungalows/TiltCard";
import DateField from "@/components/ui/DateField";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import { SITE, waHref } from "@/lib/constants";
import { plusDays, todayISO } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { quoteBungalow } from "@/services";

const PAGE_SIZE = 12;

const selectCls =
    "w-full cursor-pointer appearance-none rounded-xl border border-surface-variant bg-canvas-offwhite py-3 ps-10 pe-9 font-label-md text-label-md font-semibold text-charcoal-dark focus:border-crimson-vivid focus:outline-none";

const PILLAR_STYLES = [
    { icon: "local_fire_department", bg: "bg-crimson-vivid/15", fg: "text-crimson-vivid" },
    { icon: "bakery_dining", bg: "bg-emerald-500/15", fg: "text-emerald-400" },
    { icon: "directions_car", bg: "bg-crimson-vivid/15", fg: "text-crimson-vivid" },
    { icon: "verified_user", bg: "bg-amber-500/15", fg: "text-amber-400" },
];

export default function BungalovClient({ bungalows = [], regions = [], failed = false }) {
    const { t, tpl, locale } = useLanguage();
    const l = t.bungalowList;
    const catalogRef = useRef(null);

    const [region, setRegion] = useState("all");
    const [breakfastOnly, setBreakfastOnly] = useState(false);
    const [sortBy, setSortBy] = useState("recommended");
    const [limit, setLimit] = useState(PAGE_SIZE);

    /* Tarihler client'ta kurulur (hydration güvenliği) */
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [stays, setStays] = useState({}); // slug -> { status, data }

    useEffect(() => {
        const start = plusDays(todayISO(), 1);
        setCheckIn(start);
        setCheckOut(plusDays(start, 3));
    }, []);

    const datesFilled = Boolean(checkIn && checkOut);
    const datesValid = datesFilled && checkOut > checkIn;

    /* Bölge sekmeleri: sadece içinde bungalov olanlar */
    const regionItems = useMemo(() => {
        const list = regions
            .map((r) => {
                const inRegion = bungalows.filter((b) => b.region?.key === r.key);
                return {
                    key: r.key,
                    label: localized(r.shortLabel, locale),
                    image: r.thumbnail ?? inRegion[0]?.image,
                    count: inRegion.length,
                };
            })
            .filter((r) => r.count > 0);

        return [{ key: "all", label: l.allRegions, image: bungalows[0]?.image, count: bungalows.length }, ...list];
    }, [regions, bungalows, locale, l.allRegions]);

    const filtered = useMemo(() => {
        let list = bungalows.filter((b) => (region === "all" ? true : b.region?.key === region));
        if (breakfastOnly) list = list.filter((b) => b.breakfastIncluded);

        list = [...list];
        if (sortBy === "price-asc") list.sort((a, b) => a.defaultPricePerNight - b.defaultPricePerNight);
        else if (sortBy === "price-desc") list.sort((a, b) => b.defaultPricePerNight - a.defaultPricePerNight);
        return list; // "recommended": backend sırası (orderIndex)
    }, [bungalows, region, breakfastOnly, sortBy]);

    useEffect(() => {
        setLimit(PAGE_SIZE);
    }, [region, breakfastOnly, sortBy]);

    const shown = filtered.slice(0, limit);
    const slugsKey = shown.map((b) => b.slug).join(",");

    /* Seçili tarihler için her kartın toplam fiyatı (backend hesabı, 0,4 sn bekleyip) */
    useEffect(() => {
        if (!datesValid || shown.length === 0) {
            setStays({});
            return;
        }

        let cancelled = false;
        setStays((prev) =>
            Object.fromEntries(shown.map((b) => [b.slug, { status: "loading", data: prev[b.slug]?.data }]))
        );

        const timer = setTimeout(async () => {
            const entries = await Promise.all(
                shown.map(async (b) => {
                    try {
                        const data = await quoteBungalow(b.slug, {
                            checkInDate: checkIn,
                            checkOutDate: checkOut,
                            adults: 1,
                            childAges: [],
                        });
                        return [b.slug, { status: "ok", data }];
                    } catch (error) {
                        console.error("[quote]", b.slug, error?.message);
                        return [b.slug, { status: "error" }];
                    }
                })
            );
            if (!cancelled) setStays(Object.fromEntries(entries));
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datesValid, checkIn, checkOut, slugsKey]);

    const query = datesValid ? `?checkIn=${checkIn}&checkOut=${checkOut}` : "";

    const scrollToCatalog = () => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    /* Hero görseli: seçili bölgenin öne çıkan (yoksa ilk) bungalovu */
    const heroBungalow = useMemo(() => {
        const pool = region === "all" ? bungalows : bungalows.filter((b) => b.region?.key === region);
        return pool.find((b) => b.isFeatured) ?? pool[0] ?? bungalows[0];
    }, [bungalows, region]);

    const clearFilters = () => {
        setRegion("all");
        setBreakfastOnly(false);
    };

    return (
        <>
            {/* ─────────── HERO ─────────── */}
            <section className="relative w-full overflow-hidden bg-charcoal-dark pb-14 pt-8 text-white md:pb-20 md:pt-10">
                <div className="pointer-events-none absolute -start-40 -top-40 h-[400px] w-[400px] rounded-full bg-crimson-vivid/15 blur-[120px] md:h-[600px] md:w-[600px]" />
                <div className="pointer-events-none absolute -bottom-40 end-0 h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px] md:h-[500px] md:w-[500px]" />

                <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 md:px-8">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="flex min-w-0 flex-col items-start lg:col-span-7">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                                <span className="text-sm">🌲</span>
                                <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-rose-300">
                                    {l.heroBadge}
                                </span>
                            </div>

                            <h1 className="mb-3 break-words font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[52px]">
                                {l.heroTitle}
                            </h1>

                            <p className="mb-6 max-w-2xl font-body-md text-body-md font-light leading-relaxed text-slate-300 md:mb-8 md:text-body-lg md:font-body-lg">
                                {l.heroText}
                            </p>

                            {/* ARAMA BAR */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    scrollToCatalog();
                                }}
                                className="mb-3 w-full rounded-3xl border border-white/20 bg-surface-white p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:rounded-full lg:p-3"
                            >
                                <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
                                    <HeroField icon="calendar_month" label={l.checkIn} className="lg:flex-1">
                                        <DateField
                                            required
                                            value={checkIn}
                                            min={todayISO()}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                setCheckIn(v);
                                                if (v >= checkOut) setCheckOut(plusDays(v, 3));
                                            }}
                                            className="w-full cursor-pointer font-label-md text-label-md font-semibold text-charcoal-dark"
                                        />
                                    </HeroField>

                                    <HeroField icon="event" label={l.checkOut} className="lg:flex-1">
                                        <DateField
                                            required
                                            value={checkOut}
                                            min={checkIn ? plusDays(checkIn, 1) : todayISO()}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full cursor-pointer font-label-md text-label-md font-semibold text-charcoal-dark"
                                        />
                                    </HeroField>

                                    <button
                                        type="submit"
                                        className="col-span-2 flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-container px-8 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-[0_6px_20px_rgba(217,4,41,0.4)] transition-all hover:bg-crimson-vivid active:scale-95 lg:col-span-1 lg:rounded-full"
                                    >
                                        <Icon name="search" className="text-[18px]" />
                                        <span>{l.search}</span>
                                    </button>
                                </div>
                            </form>

                            {datesFilled && !datesValid ? (
                                <p className="mb-5 font-body-sm text-body-sm text-rose-300">{l.datesError}</p>
                            ) : (
                                <p className="mb-5 font-body-sm text-body-sm text-slate-400">{l.datesHint}</p>
                            )}

                            <div className="flex flex-col gap-2 font-label-md text-label-md text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                                {[l.guarantee1, l.guarantee2, l.guarantee3].map((text) => (
                                    <span key={text} className="flex items-center gap-1.5">
                                        <Icon name="check_circle" className="text-[14px] text-emerald-400" />
                                        {text}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Görsel: telefonda gizli (kaydırma yükü) */}
                        {heroBungalow && (
                            <div className="relative hidden md:block lg:col-span-5">
                                <TiltCard max={9} scale={1.02} className="group">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:aspect-square">
                                        <SafeImage
                                            src={mediaUrl(heroBungalow.image)}
                                            alt={mediaAlt(heroBungalow.image, locale, localized(heroBungalow.title, locale))}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        <div
                                            className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-surface-white/90 p-3.5 shadow-xl backdrop-blur-md lg:inset-x-5 lg:bottom-5 lg:p-4"
                                            style={{ transform: "translateZ(40px)" }}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 px-2 font-headline-sm text-headline-sm font-bold text-emerald-700 shadow-inner">
                                                    {heroBungalow.ratingScore != null ? (
                                                        <span dir="ltr">★ {Number(heroBungalow.ratingScore).toFixed(1)}</span>
                                                    ) : (
                                                        <Icon name="cottage" className="text-[20px]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="truncate font-headline-sm text-headline-sm font-bold leading-tight text-charcoal-dark">
                                                        {localized(heroBungalow.title, locale)}
                                                    </h4>
                                                    <p className="truncate font-label-sm text-label-sm font-medium text-secondary">
                                                        {localized(heroBungalow.location, locale)}
                                                    </p>
                                                </div>
                                            </div>
                                            {heroBungalow.isFeatured && (
                                                <span className="hidden shrink-0 rounded-full bg-emerald-100 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-emerald-800 lg:inline-flex">
                                                    {l.featured}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </TiltCard>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─────────── BÖLGE SEKMELERİ ─────────── */}
            {regionItems.length > 2 && (
                <section className="mx-auto w-full max-w-[1360px] px-4 pt-6 md:px-8">
                    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
                        {regionItems.map((r) => {
                            const selected = r.key === region;
                            return (
                                <button
                                    key={r.key}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setRegion(r.key)}
                                    className={`flex shrink-0 items-center gap-2.5 rounded-2xl bg-surface-white p-2 pe-4 text-start shadow-sm ring-2 transition-all ${selected ? "ring-crimson-vivid" : "ring-transparent hover:ring-surface-variant"
                                        }`}
                                >
                                    <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-canvas-offwhite">
                                        <SafeImage
                                            src={mediaUrl(r.image, "thumb")}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </span>
                                    <span className="flex flex-col leading-tight">
                                        <span className="whitespace-nowrap font-label-md text-label-md font-bold text-charcoal-dark">
                                            {r.label}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-secondary">{r.count}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ─────────── FİLTRE KONSOLU ─────────── */}
            <section className="mx-auto w-full max-w-[1360px] px-4 pt-4 md:px-8">
                <div className="flex flex-col gap-3 rounded-2xl border border-surface-variant/70 bg-surface-white p-3 shadow-sm sm:p-4 md:flex-row md:items-center md:justify-between">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={breakfastOnly}
                        onClick={() => setBreakfastOnly((v) => !v)}
                        className="flex items-center gap-2.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 transition-colors hover:bg-emerald-100/70"
                    >
                        <span
                            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${breakfastOnly ? "bg-emerald-600" : "bg-slate-300"
                                }`}
                        >
                            <span
                                className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm transition-all ${breakfastOnly ? "end-[2px]" : "start-[2px]"
                                    }`}
                            />
                        </span>
                        <span className="flex items-center gap-1 font-label-md text-label-md font-bold text-emerald-900">
                            <span>🍳</span>
                            {l.breakfastOnly}
                        </span>
                    </button>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                        <span className="shrink-0 font-label-md text-label-md text-secondary">
                            {tpl(l.count, { count: filtered.length })}
                        </span>
                        <label className="relative block w-full max-w-[220px]">
                            <span className="sr-only">{l.sortLabel}</span>
                            <Icon
                                name="swap_vert"
                                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[20px] text-crimson-vivid"
                            />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectCls}>
                                <option value="recommended">{l.sortRecommended}</option>
                                <option value="price-asc">{l.sortPriceAsc}</option>
                                <option value="price-desc">{l.sortPriceDesc}</option>
                            </select>
                            <Icon
                                name="expand_more"
                                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
                            />
                        </label>
                    </div>
                </div>
            </section>

            {/* ─────────── LİSTE ─────────── */}
            <section ref={catalogRef} className="mx-auto w-full max-w-[1360px] scroll-mt-24 px-4 py-6 md:px-8 md:py-8">
                {failed ? (
                    <Notice icon="cloud_off" title={l.loadError} />
                ) : shown.length === 0 ? (
                    <Notice icon="search_off" title={l.emptyTitle} text={l.emptyText}>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-2 rounded-xl bg-charcoal-dark px-6 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                        >
                            {l.clearFilters}
                        </button>
                    </Notice>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                            {shown.map((b) => (
                                <BungalowCard
                                    key={b.id}
                                    bungalow={b}
                                    mode="grid"
                                    stay={stays[b.slug]}
                                    query={query}
                                />
                            ))}
                        </div>

                        {filtered.length > limit && (
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <span className="font-body-sm text-body-sm text-secondary">
                                    {tpl(l.shown, { shown: shown.length, total: filtered.length })}
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
                )}
            </section>

            {/* ─────────── VADİ AYRICALIKLARI ─────────── */}
            <section className="relative w-full overflow-hidden bg-charcoal-dark py-14 text-white md:py-20">
                <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 md:px-8">
                    <div className="mx-auto mb-8 flex max-w-2xl flex-col items-center text-center md:mb-14">
                        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 font-label-uppercase text-label-uppercase font-bold tracking-widest text-rose-300 backdrop-blur-md">
                            {l.pillarsEyebrow}
                        </span>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                            {l.pillarsTitle}
                        </h2>
                        <p className="mt-3 max-w-2xl font-body-md text-body-md font-light text-slate-400">
                            {l.pillarsText}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                        {l.pillars.map((p, i) => {
                            const style = PILLAR_STYLES[i] ?? PILLAR_STYLES[0];
                            return (
                                <div
                                    key={i}
                                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-md sm:p-6"
                                >
                                    <div
                                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl sm:mb-5 sm:h-14 sm:w-14 ${style.bg} ${style.fg}`}
                                    >
                                        <Icon name={style.icon} className="text-[26px] sm:text-[28px]" />
                                    </div>
                                    <h3 className="mb-2 font-headline-sm text-headline-sm font-bold text-white">
                                        {tpl(p.title, { no: SITE.tursabNo })}
                                    </h3>
                                    <p className="font-body-sm text-body-sm font-light leading-relaxed text-slate-400">
                                        {p.text}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─────────── VIP ─────────── */}
            <section className="mx-auto w-full max-w-[1360px] px-4 py-12 md:px-8 md:py-20">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-charcoal-dark via-[#1a1e27] to-charcoal-dark p-5 text-white shadow-2xl sm:p-8 md:p-12">
                    <div className="pointer-events-none absolute -bottom-16 -end-16 h-80 w-80 rounded-full bg-crimson-vivid/20 blur-3xl" />
                    <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-8">
                        <div className="max-w-2xl text-center lg:text-start">
                            <span className="mb-2 block font-label-uppercase text-label-uppercase font-bold tracking-widest text-crimson-vivid">
                                {l.vipEyebrow}
                            </span>
                            <h3 className="mb-3 font-headline-md text-headline-md font-extrabold text-white md:font-headline-lg md:text-headline-lg">
                                {l.vipTitle}
                            </h3>
                            <p className="font-body-sm text-body-sm font-light leading-relaxed text-slate-300">
                                {l.vipText}
                            </p>
                        </div>

                        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                            <a
                                href={waHref() ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-lg transition-all hover:bg-emerald-500 sm:w-auto"
                            >
                                <Icon name="chat" className="text-[18px]" />
                                <span>{l.vipWhatsapp}</span>
                            </a>
                            <a
                                href={SITE.phoneHref}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/20 sm:w-auto"
                            >
                                <Icon name="call" className="text-[18px]" />
                                <span dir="ltr">{SITE.phone}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function HeroField({ icon, label, children, className = "" }) {
    return (
        <div className={`flex min-w-0 items-center gap-2 rounded-2xl bg-canvas-offwhite px-3 py-2 sm:px-4 lg:rounded-full ${className}`}>
            <Icon name={icon} className="shrink-0 text-[18px] text-crimson-vivid" />
            <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-label-uppercase text-label-uppercase font-bold leading-none text-secondary">
                    {label}
                </span>
                <div className="mt-1 min-w-0">{children}</div>
            </div>
        </div>
    );
}

function Notice({ icon, title, text, children }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-white px-5 py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-offwhite">
                <Icon name={icon} className="text-[28px] text-crimson-vivid" />
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{title}</h3>
            {text && <p className="max-w-md font-body-sm text-body-sm text-secondary">{text}</p>}
            {children}
        </div>
    );
}