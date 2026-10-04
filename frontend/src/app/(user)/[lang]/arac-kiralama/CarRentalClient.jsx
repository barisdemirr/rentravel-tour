"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import Link from "@/components/ui/LocalizedLink";
import { SITE, waHref } from "@/lib/constants";
import { plusDays, rentalDays as calcDays, todayISO } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { TONES } from "@/lib/tones";
import { corporateMessage } from "@/lib/whatsapp";
import { quoteVehicle } from "@/services";
import DateField from "@/components/ui/DateField";
import TimeField from "@/components/ui/TimeField";

/* Hero arka plan görseli */
const HERO_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAvRzs4pa1PMvu4VPDkfTXMn2SoMJD5lKt5fMgEzl8rMR0stFMqHauYXq6_hqzDfznn66WVYhIdpPWaXvdfGCMnm-bAU65jfkwIV7FgR_NP6ne6NbGX6RgDy-5RnXrBkC2r5QUg5xJReeMKTgWggTXgIaJ0Kf18iAImrvC_-x-In7hnk8wwYX2WXWip5fH1kJ3zYEXa4MUarWXiV4hFhvK9pUlRIcUbsQ-yIo-px39t_xVVeDX3bT6KzA";

const HERO_BADGE_ICONS = ["flight_takeoff", "verified_user", "key"];
const ADVANTAGE_STYLES = [
    { icon: "shield", tone: "primary" },
    { icon: "flight_land", tone: "dark" },
    { icon: "support_agent", tone: "emerald" },
    { icon: "sanitizer", tone: "neutral" },
];

export default function CarRentalClient({ segments = [], vehicles = [], hasError = false }) {
    const { t, tpl, locale } = useLanguage();
    const c = t.carRental;

    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("10:00");
    const [segment, setSegment] = useState("all");
    const [sortBy, setSortBy] = useState("recommended");
    const [quotes, setQuotes] = useState({}); // slug -> { status: "loading" | "ok" | "error", data }
    const catalogRef = useRef(null);
    const corporateRef = useRef(null);

    /* Tarihleri client'ta kur (hydration güvenliği) */
    useEffect(() => {
        const today = todayISO();
        setPickupDate(today);
        setReturnDate(plusDays(today, 3));
    }, []);

    const days = useMemo(
        () => calcDays(pickupDate, pickupTime, returnDate, returnTime),
        [pickupDate, pickupTime, returnDate, returnTime]
    );
    const periodValid = days > 0;

    /* Seçilen dönem için her aracın fiyatı backend'den (0,4 sn bekleyip) */
    useEffect(() => {
        if (!periodValid || vehicles.length === 0) {
            setQuotes({});
            return;
        }

        let cancelled = false;
        setQuotes(Object.fromEntries(vehicles.map((v) => [v.slug, { status: "loading" }])));

        const timer = setTimeout(async () => {
            const body = { pickupDate, pickupTime, returnDate, returnTime };
            const entries = await Promise.all(
                vehicles.map(async (v) => {
                    try {
                        return [v.slug, { status: "ok", data: await quoteVehicle(v.slug, body) }];
                    } catch {
                        return [v.slug, { status: "error" }];
                    }
                })
            );
            if (!cancelled) setQuotes(Object.fromEntries(entries));
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [periodValid, pickupDate, pickupTime, returnDate, returnTime, vehicles]);

    /* Segmentler: "tümü" + araç sayısı olanlar */
    const segmentList = useMemo(() => {
        const counts = {};
        vehicles.forEach((v) => {
            const key = v.segment?.key;
            if (key) counts[key] = (counts[key] || 0) + 1;
        });

        return [
            { key: "all", icon: "apps", label: c.allVehicles, count: vehicles.length },
            ...segments
                .filter((s) => counts[s.key])
                .map((s) => ({ key: s.key, icon: s.icon, label: localized(s.label, locale), count: counts[s.key] })),
        ];
    }, [segments, vehicles, locale, c.allVehicles]);

    /* Filtre + sıralama (backend sırası "önerilen") */
    const visibleVehicles = useMemo(() => {
        let list = segment === "all" ? vehicles : vehicles.filter((v) => v.segment?.key === segment);
        list = [...list];
        if (sortBy === "price-asc") list.sort((a, b) => a.defaultDailyPrice - b.defaultDailyPrice);
        else if (sortBy === "price-desc") list.sort((a, b) => b.defaultDailyPrice - a.defaultDailyPrice);
        return list;
    }, [vehicles, segment, sortBy]);

    const query = new URLSearchParams({ pickupDate, pickupTime, returnDate, returnTime }).toString();

    const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const onSearch = (e) => {
        e.preventDefault();
        scrollTo(catalogRef);
    };

    return (
        <>
            {/* ─────────── HERO ─────────── */}
            <section className="relative flex min-h-[340px] w-full items-center justify-center overflow-hidden bg-charcoal-dark py-12 md:min-h-[400px]">
                <div
                    className="absolute inset-0 scale-105 bg-cover bg-center opacity-45 transition-transform duration-1000 ease-out"
                    style={{ backgroundImage: `url('${HERO_BG}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-charcoal-dark/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/80 via-transparent to-charcoal-dark/80" />

                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-10">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-white shadow-sm backdrop-blur-md sm:px-4">
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-crimson-vivid" />
                        <span className="font-label-uppercase text-label-uppercase text-[10px] font-semibold tracking-wider sm:text-[11px]">
                            {c.heroBadge}
                        </span>
                    </div>

                    <h1 className="max-w-3xl font-headline-lg-mobile text-headline-lg-mobile font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-sm md:font-headline-lg md:text-headline-lg">
                        {c.heroTitle}
                    </h1>

                    <p className="mt-3 max-w-2xl font-body-md text-body-md text-white/90 md:font-body-lg md:text-body-lg">
                        {c.heroText}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        {c.heroBadges.map((text, i) => (
                            <HeroBadge key={text} icon={HERO_BADGE_ICONS[i]} text={text} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────── REZERVASYON BARI ─────────── */}
            <section className="relative z-20 mx-auto -mt-12 w-full max-w-5xl px-4 sm:px-6 lg:px-10">
                <div className="rounded-3xl bg-surface-white p-4 shadow-[0_20px_40px_-15px_rgba(15,17,21,0.09)] sm:p-5 md:p-6">
                    <form onSubmit={onSearch}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                            <FieldWrapper className="lg:col-span-3">
                                <FieldLabel icon="calendar_today" text={c.bar.pickupDate} />
                                <DateField
                                    required
                                    value={pickupDate}
                                    min={todayISO()}
                                    onChange={(e) => {
                                        setPickupDate(e.target.value);
                                        if (e.target.value > returnDate) setReturnDate(plusDays(e.target.value, 3));
                                    }}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            <FieldWrapper className="lg:col-span-2">
                                <FieldLabel icon="schedule" text={c.bar.pickupTime} />
                                <TimeField
                                    required
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            <FieldWrapper className="lg:col-span-3">
                                <FieldLabel icon="event_repeat" text={c.bar.returnDate} />
                                <DateField
                                    required
                                    value={returnDate}
                                    min={pickupDate || todayISO()}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            <FieldWrapper className="lg:col-span-2">
                                <FieldLabel icon="schedule" text={c.bar.returnTime} />
                                <TimeField
                                    required
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            <div className="w-full sm:col-span-2 lg:col-span-2">
                                <button
                                    type="submit"
                                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-container font-headline-sm text-headline-sm font-bold text-on-primary shadow-[0_10px_25px_-5px_rgba(187,0,38,0.35)] transition-all hover:bg-crimson-vivid active:scale-95"
                                >
                                    <Icon name="directions_car" className="text-[22px] transition-transform group-hover:scale-110" />
                                    <span>{c.bar.submit}</span>
                                </button>
                            </div>
                        </div>

                        {/* Alt bilgi satırı */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-variant pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <InfoPill icon="badge" text={c.bar.ageLicense} />
                                <InfoPill icon="credit_card" text={c.bar.cardDeposit} />
                            </div>
                            <div className="flex items-center gap-1.5 font-label-md text-label-md text-secondary">
                                <Icon name="bolt" className="text-[16px] text-crimson-vivid" />
                                {periodValid ? (
                                    <span>
                                        {c.bar.total}{" "}
                                        <strong className="text-charcoal-dark">
                                            {days} {c.bar.days}
                                        </strong>
                                    </span>
                                ) : (
                                    <span className="text-crimson-vivid">{c.bar.periodError}</span>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Kurumsal banner */}
                <button
                    type="button"
                    onClick={() => scrollTo(corporateRef)}
                    className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-primary-container/20 bg-primary-container/5 px-4 py-3 text-start transition-colors hover:bg-primary-container/10 sm:px-5"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                            <Icon name="corporate_fare" className="text-[20px]" />
                        </span>
                        <div className="min-w-0">
                            <div className="truncate font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                {c.corporateBanner.title}
                            </div>
                            <div className="truncate font-body-sm text-body-sm text-secondary">{c.corporateBanner.text}</div>
                        </div>
                    </div>
                    <Icon name="arrow_downward" className="shrink-0 text-[20px] text-crimson-vivid" />
                </button>
            </section>

            {/* ─────────── SEGMENT FİLTRELERİ ─────────── */}
            <section ref={catalogRef} className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-10 sm:px-6 lg:px-10">
                {hasError && (
                    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 font-body-sm text-body-sm text-amber-900">
                        <Icon name="warning" className="shrink-0 text-[20px] text-amber-600" />
                        <span>{c.loadError}</span>
                    </div>
                )}

                <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
                    {segmentList.map((s) => (
                        <SegmentPill key={s.key} active={segment === s.key} onClick={() => setSegment(s.key)} icon={s.icon}>
                            {s.label} ({s.count})
                        </SegmentPill>
                    ))}
                </div>

                {/* Sıralama + sayaç */}
                <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-canvas-offwhite/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                            {tpl(c.found, { count: visibleVehicles.length })}
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-label-uppercase text-label-uppercase font-semibold text-emerald-700">
                            {c.instant}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden font-label-md text-label-md text-secondary md:inline">{c.sortLabel}</span>
                        <div className="relative flex-1 sm:w-56">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full cursor-pointer appearance-none rounded-xl border border-surface-variant bg-surface-white px-4 py-2 pe-9 font-label-md text-label-md text-charcoal-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                            >
                                <option value="recommended">{c.sort.recommended}</option>
                                <option value="price-asc">{c.sort.priceAsc}</option>
                                <option value="price-desc">{c.sort.priceDesc}</option>
                            </select>
                            <Icon
                                name="unfold_more"
                                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── ARAÇ KARTLARI ─────────── */}
            <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-10">
                {visibleVehicles.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-white px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-offwhite">
                            <Icon name="no_crash" className="text-[28px] text-crimson-vivid" />
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-charcoal-dark">{c.empty.title}</h3>
                        <p className="max-w-md font-body-sm text-body-sm text-secondary">{c.empty.text}</p>
                        <button
                            type="button"
                            onClick={() => setSegment("all")}
                            className="mt-2 rounded-xl bg-charcoal-dark px-6 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                        >
                            {c.empty.showAll}
                        </button>
                    </div>
                ) : (
                    visibleVehicles.map((v) => (
                        <VehicleRow key={v.id} vehicle={v} quote={quotes[v.slug]} query={query} />
                    ))
                )}
            </section>

            {/* ─────────── KURUMSAL AYLIK KİRALAMA FORMU ─────────── */}
            <section ref={corporateRef} className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
                <CorporateForm />
            </section>

            {/* ─────────── AVANTAJLAR ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-10">
                <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
                    <span className="mb-2 inline-block rounded-full bg-primary-fixed px-4 py-1 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary-fixed-variant">
                        {c.advantages.eyebrow}
                    </span>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                        {c.advantages.title}
                    </h2>
                    <p className="mt-2 font-body-md text-body-md text-secondary">{c.advantages.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {c.advantages.items.map((item, i) => (
                        <AdvantageCard key={item.title} {...ADVANTAGE_STYLES[i]} title={item.title} text={item.text} />
                    ))}
                </div>
            </section>

            {/* ─────────── SSS ─────────── */}
            <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-10">
                <div className="mb-8 text-center">
                    <span className="mb-1 block font-label-md text-label-md font-bold uppercase tracking-wider text-crimson-vivid">
                        {c.faq.eyebrow}
                    </span>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                        {c.faq.title}
                    </h2>
                </div>

                <div className="space-y-3">
                    {c.faq.items.map((item) => (
                        <FaqItem key={item.q} question={item.q} answer={item.a} />
                    ))}
                </div>

                {/* Hızlı iletişim bannerı */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-charcoal-dark to-charcoal-surface p-6 text-white sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container">
                            <Icon name="headset_mic" className="text-[24px] text-on-primary" />
                        </div>
                        <div>
                            <h4 className="font-headline-sm text-headline-sm font-bold text-white">{c.help.title}</h4>
                            <p className="font-body-sm text-body-sm text-white/80">{c.help.text}</p>
                        </div>
                    </div>
                    <a
                        href={SITE.phoneHref}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-container px-6 py-3 font-headline-sm text-headline-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-crimson-vivid"
                    >
                        <Icon name="call" className="text-[20px]" />
                        <span dir="ltr">{SITE.phone}</span>
                    </a>
                </div>
            </section>
        </>
    );
}

/* ─────────────────────────────────────────────
   KURUMSAL AYLIK KİRALAMA FORMU
   ───────────────────────────────────────────── */
function CorporateForm() {
    const { t, locale } = useLanguage();
    const f = t.carRental.corporate;
    const typeKeys = Object.keys(f.types);

    const [form, setForm] = useState({
        company: "",
        contactName: "",
        phone: "",
        email: "",
        startDate: "",
        endDate: "",
        months: "",
        vehicleType: typeKeys[0],
        quantity: "1",
        notes: "",
    });

    const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const onSubmit = (e) => {
        e.preventDefault();

        // Mesaj her zaman Türkçe
        const message = corporateMessage({
            ...form,
            vehicleType: getDictionary("tr").carRental.corporate.types[form.vehicleType],
            locale,
        });

        const url = waHref(message);
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    const fieldCls =
        "w-full rounded-xl border border-surface-variant bg-canvas-offwhite px-4 py-3 font-label-md text-label-md text-charcoal-dark outline-none transition-all placeholder:text-secondary/50 focus:border-crimson-vivid focus:bg-white focus:ring-2 focus:ring-crimson-vivid/15";
    const labelCls = "mb-1.5 flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary";

    return (
        <div className="overflow-hidden rounded-3xl bg-surface-white shadow-[0_20px_40px_-15px_rgba(15,17,21,0.09)]">
            <div className="flex flex-col gap-3 bg-gradient-to-br from-charcoal-dark to-charcoal-surface p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary">
                        <Icon name="corporate_fare" className="text-[24px]" />
                    </span>
                    <div>
                        <span className="mb-1 block font-label-uppercase text-label-uppercase text-crimson-vivid">{f.eyebrow}</span>
                        <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-white">{f.title}</h2>
                        <p className="mt-1 max-w-xl font-body-sm text-body-sm text-white/75">{f.text}</p>
                    </div>
                </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-8">
                <div className="sm:col-span-2">
                    <label htmlFor="corp-company" className={labelCls}>
                        <Icon name="business" className="text-[14px] text-crimson-vivid" />
                        {f.company}
                    </label>
                    <input id="corp-company" required type="text" placeholder={f.companyPh} value={form.company} onChange={update("company")} className={fieldCls} />
                </div>

                <div>
                    <label htmlFor="corp-name" className={labelCls}>
                        <Icon name="person" className="text-[14px] text-crimson-vivid" />
                        {f.contactName}
                    </label>
                    <input id="corp-name" required type="text" placeholder={f.contactNamePh} value={form.contactName} onChange={update("contactName")} className={fieldCls} />
                </div>

                <div>
                    <label htmlFor="corp-phone" className={labelCls}>
                        <Icon name="call" className="text-[14px] text-crimson-vivid" />
                        {f.phone}
                    </label>
                    <input id="corp-phone" required type="tel" dir="ltr" placeholder={f.phonePh} value={form.phone} onChange={update("phone")} className={fieldCls} />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="corp-email" className={labelCls}>
                        <Icon name="mail" className="text-[14px] text-crimson-vivid" />
                        {f.email} <span className="text-secondary/60">{f.optional}</span>
                    </label>
                    <input id="corp-email" type="email" dir="ltr" placeholder={f.emailPh} value={form.email} onChange={update("email")} className={fieldCls} />
                </div>

                <div>
                    <label htmlFor="corp-start" className={labelCls}>
                        <Icon name="calendar_today" className="text-[14px] text-crimson-vivid" />
                        {f.startDate}
                    </label>
                    <DateField id="corp-start" required min={todayISO()} value={form.startDate} onChange={update("startDate")} className={fieldCls} />
                </div>

                <div>
                    <label htmlFor="corp-end" className={labelCls}>
                        <Icon name="event_repeat" className="text-[14px] text-crimson-vivid" />
                        {f.endDate} <span className="text-secondary/60">{f.optional}</span>
                    </label>
                    <DateField id="corp-end" min={form.startDate || todayISO()} value={form.endDate} onChange={update("endDate")} className={fieldCls} />
                </div>

                <div>
                    <label htmlFor="corp-months" className={labelCls}>
                        <Icon name="timelapse" className="text-[14px] text-crimson-vivid" />
                        {f.months}
                    </label>
                    <input id="corp-months" required type="number" min="1" max="24" placeholder={f.monthsPh} value={form.months} onChange={update("months")} className={fieldCls} />
                </div>

                <div>
                    <label htmlFor="corp-type" className={labelCls}>
                        <Icon name="directions_car" className="text-[14px] text-crimson-vivid" />
                        {f.vehicleType}
                    </label>
                    <select id="corp-type" value={form.vehicleType} onChange={update("vehicleType")} className={`${fieldCls} cursor-pointer`}>
                        {typeKeys.map((key) => (
                            <option key={key} value={key}>
                                {f.types[key]}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="corp-qty" className={labelCls}>
                        <Icon name="inventory_2" className="text-[14px] text-crimson-vivid" />
                        {f.quantity}
                    </label>
                    <input id="corp-qty" type="number" min="1" max="50" value={form.quantity} onChange={update("quantity")} className={fieldCls} />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="corp-notes" className={labelCls}>
                        <Icon name="notes" className="text-[14px] text-crimson-vivid" />
                        {f.notes} <span className="text-secondary/60">{f.optional}</span>
                    </label>
                    <textarea id="corp-notes" rows={3} placeholder={f.notesPh} value={form.notes} onChange={update("notes")} className={`${fieldCls} resize-none`} />
                </div>

                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container px-6 py-4 font-headline-sm text-headline-sm font-bold text-on-primary shadow-[0_10px_25px_-5px_rgba(187,0,38,0.35)] transition-all hover:bg-crimson-vivid active:scale-[0.98]"
                    >
                        <Icon name="send" className="text-[20px] transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                        <span>{f.submit}</span>
                    </button>
                    <p className="mt-3 text-center font-body-sm text-body-sm text-secondary">{f.hint}</p>
                </div>
            </form>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

function HeroBadge({ icon, text }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-label-md text-label-md text-white backdrop-blur-md sm:px-4">
            <Icon name={icon} className="text-[16px] text-crimson-vivid sm:text-[18px]" />
            <span className="text-[11px] sm:text-[12px]">{text}</span>
        </div>
    );
}

function FieldWrapper({ children, className = "" }) {
    return (
        <div className={`group cursor-pointer rounded-2xl bg-canvas-offwhite/70 p-3 transition-colors hover:bg-canvas-offwhite ${className}`}>
            {children}
        </div>
    );
}

function FieldLabel({ icon, text }) {
    return (
        <div className="mb-1 flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary">
            <Icon name={icon} className="text-[14px] text-crimson-vivid" />
            <span className="text-[10px] sm:text-[11px]">{text}</span>
        </div>
    );
}

function InfoPill({ icon, text }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1 font-label-md text-label-md text-charcoal-dark">
            <Icon name={icon} className="text-[14px] text-crimson-vivid" />
            <span className="text-[11px] sm:text-[12px]">{text}</span>
        </span>
    );
}

function SegmentPill({ active, onClick, icon, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 rounded-full px-4 py-2.5 font-label-md text-label-md font-semibold transition-all ${active
                ? "bg-primary-container text-on-primary shadow-sm"
                : "bg-surface-white text-charcoal-dark shadow-sm hover:bg-canvas-offwhite"
                }`}
        >
            {icon && <Icon name={icon} className="me-1.5 inline-block align-text-bottom text-[16px]" />}
            {children}
        </button>
    );
}

function VehicleRow({ vehicle, quote, query }) {
    const { t, tpl, locale } = useLanguage();
    const c = t.carRental;

    const name = localized(vehicle.name, locale);
    const badge = localized(vehicle.badge, locale);
    const ok = quote?.status === "ok" ? quote.data : null;
    const loading = quote?.status === "loading";
    const avgDaily = ok ? ok.rentalTotal / ok.days : vehicle.defaultDailyPrice;
    const money = (amount) => formatPrice(amount, vehicle.currency, locale);

    return (
        <article className="group flex flex-col gap-5 rounded-2xl bg-surface-white p-4 shadow-sm transition-all duration-300 hover:shadow-[0_20px_35px_-10px_rgba(187,0,38,0.12)] sm:p-6 lg:flex-row lg:items-stretch lg:gap-6 lg:p-7">
            <div className="flex w-full flex-col lg:w-[32%]">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    {badge && (
                        <span className={`rounded-full px-3 py-1 font-label-uppercase text-label-uppercase font-bold ${TONES[vehicle.badgeTone] ?? TONES.surface}`}>
                            {badge}
                        </span>
                    )}
                </div>

                <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                    {name}
                </h2>
                <p className="mb-3 font-body-sm text-body-sm text-secondary">{localized(vehicle.tagline, locale)}</p>

                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl bg-canvas-offwhite/50 p-3">
                    <SafeImage
                        src={mediaUrl(vehicle.image, "md")}
                        alt={mediaAlt(vehicle.image, locale, name)}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                {vehicle.guarantee && (
                    <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-canvas-offwhite px-3 py-1 font-label-uppercase text-label-uppercase text-secondary">
                        <Icon name="check_circle" className="text-[14px] text-emerald-600" />
                        <span className="text-[10px] sm:text-[11px]">{localized(vehicle.guarantee, locale)}</span>
                    </div>
                )}
            </div>

            <div className="flex w-full flex-col justify-center lg:w-[40%]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {vehicle.specs.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl bg-canvas-offwhite/70 p-2.5">
                            <Icon name={s.icon} className="shrink-0 text-[18px] text-crimson-vivid sm:text-[20px]" />
                            <div className="min-w-0">
                                <div className="truncate font-label-uppercase text-label-uppercase text-[9px] text-secondary sm:text-[10px]">
                                    {localized(s.label, locale)}
                                </div>
                                <div className="truncate font-label-md text-label-md text-[12px] font-semibold text-charcoal-dark sm:text-[13px]">
                                    {localized(s.value, locale)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 font-label-md text-label-md text-emerald-700">
                    <Icon name="verified" className="mt-0.5 shrink-0 text-[16px]" />
                    <span className="text-[11px] leading-snug sm:text-[12px]">{c.row.freeCancel}</span>
                </div>
            </div>

            <div className="flex w-full flex-col justify-between gap-4 rounded-2xl bg-canvas-offwhite/40 p-4 sm:p-5 lg:w-[28%] lg:bg-transparent lg:p-0">
                <div>
                    {/* Toplam: backend'den gelen dönem fiyatı. Hesaplanırken küçük animasyon, alamazsak günlük fiyat. */}
                    {loading ? (
                        <div className="flex items-center gap-2" aria-busy="true">
                            <Icon name="progress_activity" className="animate-spin text-[22px] text-crimson-vivid" />
                            <span className="h-8 w-28 animate-pulse rounded-lg bg-surface-variant" />
                        </div>
                    ) : (
                        <div className="font-price-lg text-price-2xl text-2xl md:text-3xl font-extrabold text-crimson-vivid">
                            {ok ? money(ok.rentalTotal) : money(vehicle.defaultDailyPrice)}
                            {!ok && <span className="ms-1 font-label-md text-label-md font-normal text-secondary">/ {c.row.perDay}</span>}
                        </div>
                    )}

                    {ok && (
                        <div className="font-label-md text-label-md text-secondary">
                            {tpl(c.row.daysTotal, { days: ok.days })} •{" "}
                            <span className="font-semibold text-emerald-700">{tpl(c.row.daily, { price: money(avgDaily) })}</span>
                        </div>
                    )}

                    <div className="mt-1 flex items-center gap-1 font-body-sm text-body-sm text-secondary">
                        <Icon name="shield" className="text-[14px] text-crimson-vivid" />
                        <span>{c.row.taxIncluded}</span>
                    </div>
                </div>

                <Link
                    href={`/arac-kiralama/${vehicle.slug}?${query}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-3 font-headline-sm text-headline-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-crimson-vivid"
                >
                    <span>{c.row.rentNow}</span>
                    <Icon name="arrow_forward" className="text-[18px] rtl:-scale-x-100" />
                </Link>
            </div>
        </article>
    );
}

const ADVANTAGE_TONES = {
    primary: { wrapper: "bg-primary-fixed", icon: "text-primary" },
    dark: { wrapper: "bg-charcoal-dark/10", icon: "text-charcoal-dark" },
    emerald: { wrapper: "bg-emerald-500/15", icon: "text-emerald-700" },
    neutral: { wrapper: "bg-surface-container-high", icon: "text-charcoal-dark" },
};

function AdvantageCard({ icon, tone, title, text }) {
    const style = ADVANTAGE_TONES[tone] || ADVANTAGE_TONES.primary;
    return (
        <div className="flex flex-col items-start rounded-2xl bg-surface-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${style.wrapper}`}>
                <Icon name={icon} className={`text-[26px] ${style.icon}`} />
            </div>
            <h4 className="mb-1 font-headline-sm text-headline-sm font-bold text-charcoal-dark">{title}</h4>
            <p className="font-body-sm text-body-sm leading-relaxed text-secondary">{text}</p>
        </div>
    );
}

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="overflow-hidden rounded-2xl bg-surface-white shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 p-5 text-start focus:outline-none"
            >
                <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{question}</span>
                <Icon
                    name="expand_more"
                    className={`shrink-0 text-[22px] text-secondary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-5 font-body-sm text-body-sm leading-relaxed text-secondary">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}