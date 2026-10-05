"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import BungalowCard from "@/components/cards/BungalowCard";
import TiltCard from "@/components/bungalows/TiltCard";
import DateField from "@/components/ui/DateField";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import { SITE, waHref } from "@/lib/constants";
import { plusDays, todayISO } from "@/lib/dates";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { quoteBungalow } from "@/services";
import Link from "@/components/ui/LocalizedLink";

const PAGE_SIZE = 12;
const SLIDE_MS = 3000; // hero görselinin değişim süresi

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
    const reduce = useReducedMotion();

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

    /* ── Hero görsel döngüsü: tüm bungalovların ana görselleri sırayla ── */
    const slides = useMemo(
        () =>
            bungalows
                .filter((b) => b.image)
                .map((b) => ({
                    slug: b.slug,
                    image: b.image,
                    title: localized(b.title, locale),
                    location: localized(b.location, locale),
                })),
        [bungalows, locale]
    );

    const [slideIndex, setSlideIndex] = useState(0);

    useEffect(() => {
        if (reduce || slides.length < 2) return;
        const timer = setInterval(() => setSlideIndex((i) => (i + 1) % slides.length), SLIDE_MS);
        return () => clearInterval(timer);
    }, [reduce, slides.length]);

    const slide = slides[slideIndex % Math.max(slides.length, 1)];

    /* ── Bölge sekmeleri: sadece içinde bungalov olanlar ── */
    const regionItems = useMemo(() => {
        const list = regions
            .map((r) => ({
                key: r.key,
                label: localized(r.shortLabel, locale),
                count: bungalows.filter((b) => b.region?.key === r.key).length,
            }))
            .filter((r) => r.count > 0);

        return [{ key: "all", label: l.allRegions, count: bungalows.length }, ...list];
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

    const clearFilters = () => {
        setRegion("all");
        setBreakfastOnly(false);
    };

    const rotating = !reduce && slides.length > 1;

    return (
        <>
            {/* ─────────── HERO ─────────── */}
            <section className="relative w-full overflow-hidden bg-charcoal-dark pb-10 pt-8 text-white md:pb-16 md:pt-10">
                {/* Mobil: dönen görsel arka planda */}
                <div aria-hidden="true" className="absolute inset-0 md:hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={slideIndex}
                            initial={{ opacity: 0, scale: 1.06 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            <SafeImage src={mediaUrl(slide?.image, "lg")} alt="" className="h-full w-full object-cover" />
                        </motion.div>
                    </AnimatePresence>
                    {/* Metin okunabilirliği için koyu katman */}
                    <div className="absolute inset-0 bg-charcoal-dark/45" />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/35 to-transparent" />
                </div>

                <div className="pointer-events-none absolute -start-40 -top-40 h-[400px] w-[400px] rounded-full bg-crimson-vivid/15 blur-[120px] md:h-[600px] md:w-[600px]" />
                <div className="pointer-events-none absolute -bottom-40 end-0 hidden h-[300px] w-[300px] rounded-full bg-emerald-500/10 blur-[100px] md:block md:h-[500px] md:w-[500px]" />

                <div className="relative z-10 mx-auto w-full max-w-[1360px] px-4 md:px-8">
                    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="flex min-w-0 flex-col items-start lg:col-span-7">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 shadow-sm backdrop-blur-md">
                                <span className="shrink-0 text-sm">🌲</span>
                                <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-rose-300">
                                    {l.heroBadge}
                                </span>
                            </div>

                            <h1 className="mb-5 w-full text-pretty break-words font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:mb-6 md:text-5xl lg:text-[52px]">
                                {l.heroTitle}
                            </h1>

                            {/* ARAMA BAR */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    scrollToCatalog();
                                }}
                                className="mb-3 w-full rounded-3xl border border-white/20 bg-surface-white p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.4)] lg:rounded-full lg:p-3"
                            >
                                <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 lg:flex lg:flex-row lg:items-center lg:gap-3">
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
                                        className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary-container px-8 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-[0_6px_20px_rgba(217,4,41,0.4)] transition-all hover:bg-crimson-vivid active:scale-95 sm:col-span-2 lg:col-span-1 lg:rounded-full"
                                    >
                                        <Icon name="search" className="text-[18px]" />
                                        <span>{l.search}</span>
                                    </button>
                                </div>
                            </form>

                            {datesFilled && !datesValid ? (
                                <p className="mb-4 font-body-sm text-body-sm text-rose-300">{l.datesError}</p>
                            ) : (
                                <p className="mb-4 font-body-sm text-body-sm text-slate-400">{l.datesHint}</p>
                            )}

                            {/* Mobil: ince zaman çubuğu, görsel değişimini belli eder */}
                            {rotating && (
                                <div
                                    aria-hidden="true"
                                    className="mb-5 h-0.5 w-24 overflow-hidden rounded-full bg-white/15 md:hidden"
                                >
                                    <motion.div
                                        key={slideIndex}
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                                        style={{ transformOrigin: "left" }}
                                        className="h-full w-full bg-crimson-vivid rtl:origin-right"
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-2 font-label-md text-label-md text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                                {[l.guarantee1, l.guarantee2, l.guarantee3].map((text) => (
                                    <span key={text} className="flex items-start gap-1.5">
                                        <Icon
                                            name="check_circle"
                                            className="mt-0.5 shrink-0 text-[14px] text-emerald-400"
                                        />
                                        {text}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Masaüstü: 3B kart, kenarında zaman çubuğu */}
                        {slide && (
                            <div className="relative hidden md:block lg:col-span-5">
                                <TiltCard max={9} scale={1.02} className="group">
                                    <Link
                                        href={`/bungalov-konaklama/${slide.slug}${query}`}
                                        aria-label={slide.title}
                                        className="relative block aspect-[16/10] overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:aspect-square"
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={slideIndex}
                                                initial={{ opacity: 0, scale: 1.06 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.7, ease: "easeOut" }}
                                                className="absolute inset-0"
                                            >
                                                <SafeImage
                                                    src={mediaUrl(slide.image, "lg")}
                                                    alt={mediaAlt(slide.image, locale, slide.title)}
                                                    className="h-full w-full object-cover"
                                                />
                                            </motion.div>
                                        </AnimatePresence>

                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                        {/* Kartın etrafında dolaşan zaman çubuğu */}
                                        {rotating && <BorderTimer key={slideIndex} duration={SLIDE_MS} />}

                                        <div
                                            className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-surface-white/90 p-3.5 shadow-xl backdrop-blur-md lg:inset-x-5 lg:bottom-5 lg:p-4"
                                            style={{ transform: "translateZ(40px)" }}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson-vivid/10 text-crimson-vivid shadow-inner">
                                                    <Icon name="cottage" className="text-[20px]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="truncate font-headline-sm text-headline-sm font-bold leading-tight text-charcoal-dark">
                                                        {slide.title}
                                                    </h4>
                                                    <p className="truncate font-label-sm text-label-sm font-medium text-secondary">
                                                        {slide.location}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </TiltCard>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─────────── BÖLGE SEKMELERİ ─────────── */}
            {regionItems.length > 2 && (
                <section className="relative z-10 mx-auto w-full max-w-[1360px] px-4 pt-6 md:px-8 md:pt-8">
                    {/* py-1: overflow-x-auto dikeyde de kırptığı için halka kesilmesin */}
                    <div className="no-scrollbar flex gap-2 overflow-x-auto py-1 pe-4 md:pe-0">
                        {regionItems.map((r) => {
                            const selected = r.key === region;
                            return (
                                <button
                                    key={r.key}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => setRegion(r.key)}
                                    className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 font-label-md text-label-md font-semibold transition-colors sm:px-4 sm:py-2.5 ${selected
                                        ? "border-crimson-vivid bg-crimson-vivid text-on-primary"
                                        : "border-surface-variant bg-surface-white text-charcoal-dark hover:border-crimson-vivid"
                                        }`}
                                >
                                    {r.label}
                                    <span
                                        className={`font-label-sm text-label-sm ${selected ? "text-on-primary/70" : "text-secondary"
                                            }`}
                                    >
                                        {r.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ─────────── FİLTRE KONSOLU ─────────── */}
            <section className="mx-auto w-full max-w-[1360px] px-4 pt-3 md:px-8 md:pt-4">
                <div className="flex flex-col gap-3 rounded-2xl border border-surface-variant/70 bg-surface-white p-3 shadow-sm sm:p-4 md:flex-row md:items-center md:justify-between">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={breakfastOnly}
                        onClick={() => setBreakfastOnly((v) => !v)}
                        className="flex w-full items-center gap-2.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 transition-colors hover:bg-emerald-100/70 sm:w-auto sm:self-start"
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
                        <span className="flex min-w-0 items-center gap-1 font-label-md text-label-md font-bold text-emerald-900">
                            <span className="shrink-0">🍳</span>
                            <span className="truncate">{l.breakfastOnly}</span>
                        </span>
                    </button>

                    <div className="flex items-center gap-3 md:justify-end">
                        <span className="shrink-0 font-label-md text-label-md text-secondary">
                            {tpl(l.count, { count: filtered.length })}
                        </span>
                        <label className="relative block min-w-0 flex-1 md:w-[220px] md:flex-none">
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
                        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                            {shown.map((b) => (
                                <BungalowCard key={b.id} bungalow={b} mode="grid" stay={stays[b.slug]} query={query} />
                            ))}
                        </div>

                        {filtered.length > limit && (
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <span className="text-center font-body-sm text-body-sm text-secondary">
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
                        <h2 className="text-pretty font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
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
                                        className={`mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:mb-5 sm:h-14 sm:w-14 ${style.bg} ${style.fg}`}
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
                            <h3 className="mb-3 text-pretty font-headline-md text-headline-md font-extrabold text-white md:font-headline-lg md:text-headline-lg">
                                {l.vipTitle}
                            </h3>
                            <p className="font-body-sm text-body-sm font-light leading-relaxed text-slate-300">
                                {l.vipText}
                            </p>
                        </div>

                        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row">
                            <a
                                href={waHref() ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-lg transition-all hover:bg-emerald-500"
                            >
                                <Icon name="chat" className="shrink-0 text-[18px]" />
                                <span>{l.vipWhatsapp}</span>
                            </a>
                            <a
                                href={SITE.phoneHref}
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white backdrop-blur-md transition-all hover:bg-white/20"
                            >
                                <Icon name="call" className="shrink-0 text-[18px]" />
                                <span dir="ltr">{SITE.phone}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

/* ── Kartın kenarını saran zaman çubuğu ── */
function BorderTimer({ duration }) {
    return (
        <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
        >
            <motion.rect
                x="0.6"
                y="0.6"
                width="98.8"
                height="98.8"
                rx="5"
                ry="5"
                fill="none"
                stroke="var(--color-crimson-vivid)"
                strokeWidth="1.2"
                strokeLinecap="round"
                pathLength={1}
                initial={{ strokeDasharray: 1, strokeDashoffset: 1 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function HeroField({ icon, label, children, className = "" }) {
    return (
        <div
            className={`flex min-w-0 items-center gap-2 rounded-2xl bg-canvas-offwhite px-3 py-2 sm:px-4 lg:rounded-full ${className}`}
        >
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
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-canvas-offwhite">
                <Icon name={icon} className="text-[28px] text-crimson-vivid" />
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{title}</h3>
            {text && <p className="max-w-md font-body-sm text-body-sm text-secondary">{text}</p>}
            {children}
        </div>
    );
}   