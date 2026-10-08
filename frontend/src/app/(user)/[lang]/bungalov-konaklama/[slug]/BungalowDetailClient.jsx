"use client";

import { useEffect, useMemo, useState } from "react";
import { GuestCounter } from "@/components/sections/TourDetailBlocks";
import ChildAgesField from "@/components/ui/ChildAgesField";
import DateField from "@/components/ui/DateField";
import Icon from "@/components/ui/Icon";
import ImageGallery from "@/components/ui/ImageGallery";
import Link from "@/components/ui/LocalizedLink";
import SafeImage from "@/components/ui/SafeImage";
import { SITE, waHref } from "@/lib/constants";
import { plusDays, todayISO } from "@/lib/dates";
import { ApiError } from "@/lib/api";
import { formatPrice, parseDateOnly } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { bungalowMessage } from "@/lib/whatsapp";
import { quoteBungalow } from "@/services";
import { toHtml } from "@/lib/richText";
import { readQuery, toInt } from "@/lib/query";

const MAX_ADULTS = 20;
const MAX_CHILDREN = 10;
const MAX_EXTRA_COUNT = 20;

const nightsBetween = (from, to) =>
    from && to ? Math.round((parseDateOnly(to) - parseDateOnly(from)) / 86400000) : 0;

function errorMessage(error, fallback) {
    if (error instanceof ApiError && error.isValidationError()) return error.getAllMessages().join(" ");
    return fallback;
}

export default function BungalowDetailClient({ bungalow, initialDates }) {
    const { t, tpl, locale } = useLanguage();
    const d = { ...t.tourDetail, ...t.bungalowDetail };

    const title = localized(bungalow.title, locale);
    const money = (amount) => formatPrice(amount, bungalow.currency, locale);

    const standardCapacity = bungalow.standardCapacity ?? 2;
    const maxCapacity = bungalow.maxCapacity ?? 2;

    /* Katalogdan gelen ekstra hizmetler (bungalova atanmış) */
    const bungalowExtras = bungalow.extras ?? [];

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [adults, setAdults] = useState(2);
    const [ages, setAges] = useState([]);
    const [extraCounts, setExtraCounts] = useState({}); // { [extraId]: count } — sadece Once modu için dolu
    const [quote, setQuote] = useState({ status: "idle" });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const today = todayISO();
        const ci = initialDates?.checkIn && initialDates.checkIn >= today ? initialDates.checkIn : plusDays(today, 1);
        const co = initialDates?.checkOut && initialDates.checkOut > ci ? initialDates.checkOut : plusDays(ci, 2);
        setCheckIn(ci);
        setCheckOut(co);
    }, [initialDates]);

    useEffect(() => {
        const q = readQuery();
        setAdults(toInt(q.get("adults"), 1, MAX_ADULTS, 2));
        const children = toInt(q.get("children"), 0, MAX_CHILDREN, 0);
        if (children > 0) setAges(Array(children).fill(""));
    }, []);

    const nights = nightsBetween(checkIn, checkOut);
    const datesFilled = Boolean(checkIn && checkOut);
    const nightsValid = nights >= 1;
    const agesReady = ages.every((a) => a !== "");
    const totalGuests = adults + ages.length;
    const overCapacity = totalGuests > maxCapacity;
    const canAddAdult = totalGuests < maxCapacity;
    const canAddChild = ages.length < MAX_CHILDREN && totalGuests < maxCapacity;
    const ready = datesFilled && nightsValid && agesReady && !overCapacity;
    const agesKey = ages.join(",");

    /* ── Ekstra seçim yönetimi ── */

    // Once mode: adet toggle / değiştir. Daily mode: checkbox toggle (adet 1).
    const toggleExtra = (extra) => {
        setExtraCounts((c) => {
            const next = { ...c };
            if (next[extra.extraId]) delete next[extra.extraId];
            else next[extra.extraId] = 1;
            return next;
        });
    };

    const setExtraCount = (extraId, count) => {
        setExtraCounts((c) => {
            if (count <= 0) {
                const next = { ...c };
                delete next[extraId];
                return next;
            }
            return { ...c, [extraId]: Math.min(MAX_EXTRA_COUNT, count) };
        });
    };

    const selectedExtraIds = Object.keys(extraCounts).filter((id) => extraCounts[id] > 0);
    const selectedExtraCounts = Object.fromEntries(
        selectedExtraIds.map((id) => [id, extraCounts[id]])
    );
    // useMemo key: seçili ekstra ve adetler değişince yeniden quote çekilsin
    const extrasKey =
        selectedExtraIds.slice().sort().join(",") +
        "|" +
        selectedExtraIds.map((id) => extraCounts[id]).join(",");

    /* Fiyat: backend quote */
    useEffect(() => {
        if (!ready) {
            setQuote(datesFilled && !nightsValid ? { status: "invalid" } : { status: "idle" });
            return;
        }

        let cancelled = false;
        setQuote((q) => ({ status: "loading", data: q.data }));

        const timer = setTimeout(async () => {
            try {
                const data = await quoteBungalow(bungalow.slug, {
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    adults,
                    childAges: ages.map(Number),
                    extraIds: selectedExtraIds,
                    extraCounts: selectedExtraCounts,
                });
                if (!cancelled) setQuote({ status: "ok", data });
            } catch (error) {
                console.error("[quote]", error);
                if (!cancelled) setQuote({ status: "error", message: errorMessage(error, d.quoteError) });
            }
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, datesFilled, nightsValid, bungalow.slug, checkIn, checkOut, adults, agesKey, extrasKey]);

    const q = quote.status === "ok" || quote.status === "loading" ? quote.data : null;
    const loading = quote.status === "loading";
    const nightly = q ? q.accommodationTotal / q.nights : bungalow.defaultPricePerNight;
    const total = q?.total ?? null;

    /* WhatsApp için ekstraları hazır metne çevir */
    const extraLabelsForWhatsapp = useMemo(() => {
        if (!bungalowExtras.length) return [];
        return selectedExtraIds
            .map((id) => {
                const e = bungalowExtras.find((x) => x.extraId === id);
                if (!e) return null;
                const count = extraCounts[id] ?? 1;
                const name = localized(e.title, "tr");
                if (e.chargeMode === "Daily") {
                    return `${name} (${nights || 0} gece × ${money(e.price)})`;
                }
                return count > 1 ? `${name} (${count} × ${money(e.price)})` : name;
            })
            .filter(Boolean);
    }, [bungalowExtras, extrasKey, extraCounts, nights, locale]);

    const whatsappHref = useMemo(
        () =>
            waHref(
                bungalowMessage({
                    bungalowTitle: localized(bungalow.title, "tr"),
                    checkIn,
                    checkOut,
                    nights: nightsValid ? nights : null,
                    adults,
                    childAges: ages.filter((a) => a !== "").map(Number),
                    extras: extraLabelsForWhatsapp,
                    total: q?.total,
                    currency: bungalow.currency,
                    locale,
                })
            ),
        [bungalow, checkIn, checkOut, nights, nightsValid, adults, ages, extraLabelsForWhatsapp, q, locale]
    );

    const handleShare = async () => {
        const url = window.location.href;
        const shareTitle = `${title} — Rentravel Turizm`;
        if (navigator.share) {
            try {
                await navigator.share({ title: shareTitle, url });
            } catch {
                /* iptal */
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch {
                /* sessiz */
            }
        }
    };

    const images = [bungalow.image, ...(bungalow.gallery ?? [])]
        .filter(Boolean)
        .filter((img, i, arr) => arr.findIndex((x) => x.id === img.id) === i);

    const longDescription = localized(bungalow.longDescription, locale);
    const shortDescription = localized(bungalow.description, locale);
    const amenities = bungalow.detailedAmenities?.length ? bungalow.detailedAmenities : bungalow.amenities ?? [];
    const breakfast = bungalow.breakfastCard;
    const hasBreakfast = Boolean(breakfast) || bungalow.breakfastIncluded;
    const hasLocation = (bungalow.distances?.length ?? 0) > 0 || Boolean(localized(bungalow.locationNote, locale));

    const sections = [
        bungalow.featureStrip?.length > 0 && { id: "genel-bilgiler", label: d.anchorGeneral },
        { id: "konaklama", label: d.anchorStay },
        bungalowExtras.length > 0 && { id: "ekstralar", label: "Ekstra Hizmetler" },
        hasBreakfast && { id: "kahvalti", label: d.anchorBreakfast },
        amenities.length > 0 && { id: "olanaklar", label: d.anchorAmenities },
        hasLocation && { id: "harita", label: d.anchorLocation },
        bungalow.rules?.length > 0 && { id: "kurallar", label: d.anchorRules },
    ].filter(Boolean);

    /* ───────── Rezervasyon paneli ───────── */
    const bookingPanel = (
        <div className="flex flex-col gap-5 rounded-3xl border border-surface-variant/60 bg-surface-white p-4 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.08)] sm:p-6">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-charcoal-dark px-4 py-4 text-white shadow-md sm:px-5">
                <div className="flex min-w-0 items-baseline gap-1.5">
                    <span className="font-headline-md text-headline-md font-extrabold text-white">{money(nightly)}</span>
                    <span className="font-body-sm text-body-sm text-white/70">{d.perNight}</span>
                </div>
                {bungalow.breakfastIncluded && (
                    <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-white">
                        {d.breakfastIncluded}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-canvas-offwhite p-3">
                    <span className="font-label-uppercase text-label-uppercase text-secondary">{d.checkIn}</span>
                    <DateField
                        required
                        value={checkIn}
                        min={todayISO()}
                        onChange={(e) => {
                            const v = e.target.value;
                            setCheckIn(v);
                            if (v >= checkOut) setCheckOut(plusDays(v, 2));
                        }}
                        className="w-full cursor-pointer font-label-md text-label-md font-bold text-charcoal-dark"
                    />
                </div>
                <div className="flex min-w-0 flex-col gap-1 rounded-2xl bg-canvas-offwhite p-3">
                    <span className="font-label-uppercase text-label-uppercase text-secondary">{d.checkOut}</span>
                    <DateField
                        required
                        value={checkOut}
                        min={checkIn ? plusDays(checkIn, 1) : todayISO()}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full cursor-pointer font-label-md text-label-md font-bold text-charcoal-dark"
                    />
                </div>
            </div>

            {datesFilled && !nightsValid && (
                <p className="rounded-xl bg-crimson-vivid/10 px-3 py-2 font-label-md text-label-md text-crimson-vivid">
                    {d.nightsError}
                </p>
            )}

            {/* Kişiler — kapasite kontrolü */}
            <div className="flex flex-col gap-3">
                <GuestCounter
                    label={d.adults}
                    sub={d.adultsSub}
                    count={adults}
                    onDec={() => setAdults((n) => Math.max(1, n - 1))}
                    onInc={() => setAdults((n) => (totalGuests < maxCapacity ? Math.min(MAX_ADULTS, n + 1) : n))}
                    decLabel={`${d.adults}: ${d.decrease}`}
                    incLabel={`${d.adults}: ${d.increase}`}
                    incDisabled={!canAddAdult}
                />

                <ChildAgesField ages={ages} setAges={setAges} sub={d.childrenSub} max={MAX_CHILDREN} canAdd={canAddChild} />

                {/* Kapasite bilgisi ve uyarı */}
                <div className="flex flex-col gap-1.5 rounded-2xl bg-canvas-offwhite px-3.5 py-3">
                    <div className="flex items-center justify-between font-label-uppercase text-label-uppercase">
                        <span className="text-secondary">{d.capacityLabel}</span>
                        <span className={overCapacity ? "text-crimson-vivid font-bold" : "text-charcoal-dark font-bold"}>
                            {totalGuests} / {maxCapacity}
                        </span>
                    </div>
                    {overCapacity && (
                        <p className="font-body-sm text-body-sm text-crimson-vivid">
                            {tpl(d.capacityExceeded, { max: maxCapacity })}
                        </p>
                    )}
                </div>
            </div>

            {/* EKSTRA HİZMETLER */}
            {bungalowExtras.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Icon name="add_circle" className="text-[18px] text-crimson-vivid" />
                        <span className="font-label-uppercase text-label-uppercase font-bold text-secondary">
                            Ekstra Hizmetler
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {bungalowExtras.map((extra) => {
                            const selected = extraCounts[extra.extraId] > 0;
                            const isDaily = extra.chargeMode === "Daily";
                            const count = extraCounts[extra.extraId] ?? 0;

                            return (
                                <div
                                    key={extra.extraId}
                                    className={`flex flex-col gap-2 rounded-2xl border-2 p-3 transition-colors ${selected
                                            ? "border-crimson-vivid bg-crimson-vivid/5"
                                            : "border-transparent bg-canvas-offwhite"
                                        }`}
                                >
                                    <button
                                        type="button"
                                        role={isDaily ? "checkbox" : undefined}
                                        aria-checked={isDaily ? selected : undefined}
                                        onClick={() => toggleExtra(extra)}
                                        className="flex items-center gap-3 text-start"
                                    >
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${selected
                                                    ? "border-crimson-vivid bg-crimson-vivid text-white"
                                                    : "border-secondary/40"
                                                }`}
                                        >
                                            {selected && <Icon name="check" className="text-[13px]" />}
                                        </span>
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-white text-crimson-vivid">
                                            <Icon name={extra.icon || "add_circle"} className="text-[18px]" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-label-md text-label-md font-bold text-charcoal-dark">
                                                {localized(extra.title, locale)}
                                            </span>
                                            <span className="block text-[11px] text-secondary">
                                                {money(extra.price)} ·{" "}
                                                {isDaily ? "gecelik" : "tek seferlik"}
                                            </span>
                                        </span>
                                    </button>

                                    {selected && !isDaily && (
                                        <div className="flex items-center justify-between gap-2 border-t border-crimson-vivid/15 pt-2">
                                            <span className="font-body-sm text-body-sm text-secondary">Adet</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExtraCount(extra.extraId, count - 1);
                                                    }}
                                                    disabled={count <= 1}
                                                    aria-label="Azalt"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-white text-charcoal-dark shadow-sm transition-colors hover:bg-crimson-vivid hover:text-white disabled:opacity-30 disabled:hover:bg-surface-white disabled:hover:text-charcoal-dark"
                                                >
                                                    −
                                                </button>
                                                <span className="w-6 text-center font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                                    {count}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setExtraCount(extra.extraId, count + 1);
                                                    }}
                                                    disabled={count >= MAX_EXTRA_COUNT}
                                                    aria-label="Arttır"
                                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-white text-charcoal-dark shadow-sm transition-colors hover:bg-crimson-vivid hover:text-white disabled:opacity-30 disabled:hover:bg-surface-white disabled:hover:text-charcoal-dark"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Fiyat dökümü */}
            <div className="flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4" aria-busy={loading}>
                {quote.status === "error" && (
                    <p className="font-body-sm text-body-sm text-crimson-vivid">{quote.message}</p>
                )}

                {q && (
                    <>
                        {q.nightLines.map((line, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                                <span className="text-secondary">
                                    {tpl(d.nightsLine, { nights: line.periods, price: money(line.unitPrice) })}
                                    {line.label && localized(line.label, locale) && (
                                        <span className="block text-[11px] text-secondary/70">
                                            {localized(line.label, locale)}
                                        </span>
                                    )}
                                </span>
                                <span className="shrink-0 font-semibold text-charcoal-dark">{money(line.subtotal)}</span>
                            </div>
                        ))}

                        {q.extraAdults && q.extraAdults.count > 0 && (
                            <div className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                                <span className="text-secondary">
                                    {tpl(d.extraAdultLine, {
                                        count: q.extraAdults.count,
                                        price: money(q.extraAdults.nightlyCharge),
                                    })}
                                    <span className="block text-[11px] text-secondary/70">
                                        {tpl(d.extraAdultSub, {
                                            nights: q.extraAdults.nights,
                                            standard: standardCapacity,
                                        })}
                                    </span>
                                </span>
                                <span className="shrink-0 font-semibold text-charcoal-dark">
                                    {money(q.extraAdults.total)}
                                </span>
                            </div>
                        )}

                        {q.children.map((c, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                                <span className="text-secondary">
                                    {tpl(d.childLine, { age: c.age })}
                                    <span className="block text-[11px] text-secondary/70">
                                        {c.nightlyCharge > 0
                                            ? tpl(d.childCharge, { price: money(c.nightlyCharge), nights: c.nights })
                                            : d.childFree}
                                    </span>
                                </span>
                                <span className="shrink-0 font-semibold text-charcoal-dark">
                                    {c.total > 0 ? money(c.total) : d.free}
                                </span>
                            </div>
                        ))}

                        {/* EKSTRA HİZMET SATIRLARI */}
                        {q.extras?.map((ex, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                                <span className="text-secondary">
                                    {localized(ex.title, locale)}
                                    <span className="block text-[11px] text-secondary/70">
                                        {ex.chargeMode === "Daily"
                                            ? `${money(ex.unitPrice)} × ${ex.nights} gece`
                                            : `${ex.count} × ${money(ex.unitPrice)}`}
                                    </span>
                                </span>
                                <span className="shrink-0 font-semibold text-charcoal-dark">
                                    {money(ex.subtotal)}
                                </span>
                            </div>
                        ))}
                    </>
                )}

                {bungalow.breakfastIncluded && (
                    <div className="flex items-center justify-between font-body-sm text-body-sm">
                        <span className="text-secondary">{d.breakfastLine}</span>
                        <span className="font-semibold text-emerald-600">{d.free}</span>
                    </div>
                )}

                <div className="mt-1 flex items-center justify-between gap-3 border-t border-surface-variant pt-2.5">
                    <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{d.total}</span>
                    <span className="flex items-center gap-2 font-headline-md text-headline-md font-extrabold text-crimson-vivid">
                        {loading && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
                        {total != null ? money(total) : "—"}
                    </span>
                </div>
            </div>

            {/* CTA'lar */}
            <div className="flex flex-col gap-3">
                <a
                    href={overCapacity ? "#" : whatsappHref ?? "#"}
                    target={overCapacity ? undefined : "_blank"}
                    rel={overCapacity ? undefined : "noopener noreferrer"}
                    aria-disabled={overCapacity}
                    onClick={(e) => overCapacity && e.preventDefault()}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-label-uppercase text-label-uppercase font-bold tracking-wider shadow-md transition-all ${overCapacity
                            ? "cursor-not-allowed bg-surface-variant text-secondary opacity-60"
                            : "bg-primary-container text-on-primary hover:scale-[1.01] hover:bg-crimson-vivid active:scale-[0.98]"
                        }`}
                >
                    <Icon name="chat" className="text-[22px]" />
                    <span>{overCapacity ? d.capacityBlocked : d.whatsapp}</span>
                </a>
                <a
                    href={SITE.phoneHref}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal-dark py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-sm transition-colors hover:bg-charcoal-surface"
                >
                    <Icon name="call" className="text-[18px]" />
                    <span dir="ltr">{SITE.phone}</span>
                </a>
            </div>

            <div className="flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4">
                <div className="flex items-center gap-2 font-label-md text-label-md font-semibold text-charcoal-dark">
                    <Icon name="verified" className="shrink-0 text-[18px] text-crimson-vivid" />
                    <span>{d.trust1}</span>
                </div>
                <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                    <Icon name="support_agent" className="shrink-0 text-[18px] text-crimson-vivid" />
                    <span>{d.trust2}</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-6">
                <nav
                    aria-label={d.breadcrumbLabel}
                    className="no-scrollbar mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
                >
                    <Link href="/" className="transition-colors hover:text-crimson-vivid">
                        {d.home}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <Link href="/bungalov-konaklama" className="transition-colors hover:text-crimson-vivid">
                        {d.bungalows}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <span className="font-semibold text-charcoal-dark">{title}</span>
                </nav>

                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-0.5 font-label-md text-label-md font-semibold text-on-primary-fixed-variant">
                                <Icon name="verified" className="text-[14px]" />
                                {tpl(d.tursabBadge, { no: SITE.tursabNo })}
                            </span>
                            {bungalow.region && (
                                <span className="rounded-full bg-canvas-offwhite px-3 py-0.5 font-label-md text-label-md text-secondary">
                                    {localized(bungalow.region.fullLabel, locale)}
                                </span>
                            )}
                        </div>

                        <h1 className="break-words font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {title}
                        </h1>

                        {localized(bungalow.location, locale) && (
                            <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                                <Icon name="location_on" className="shrink-0 text-[18px] text-crimson-vivid" />
                                <span>{localized(bungalow.location, locale)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-white px-4 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark shadow-sm transition-colors hover:bg-canvas-offwhite"
                        >
                            <Icon name="share" className="text-[18px]" />
                            <span>{copied ? d.copied : d.share}</span>
                        </button>
                    </div>
                </div>

                <ImageGallery images={images} title={title} />

                <AnchorPills sections={sections} />

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-x-8">
                    <div className="order-first min-w-0 lg:order-none lg:col-span-4 lg:col-start-9 lg:row-start-1">
                        <div className="lg:sticky lg:top-28">{bookingPanel}</div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-5 lg:col-span-8 lg:col-start-1 lg:row-start-1">
                        {bungalow.featureStrip?.length > 0 && (
                            <div
                                id="genel-bilgiler"
                                className="grid scroll-mt-32 grid-cols-2 gap-2 rounded-3xl bg-surface-white p-3 shadow-sm sm:grid-cols-3 md:grid-cols-6 md:gap-3 md:p-5"
                            >
                                {bungalow.featureStrip.map((f, i) => (
                                    <div key={i} className="flex min-w-0 flex-col items-center rounded-2xl p-2 text-center">
                                        <Icon name={f.icon} className="mb-1 text-[26px] text-crimson-vivid" />
                                        <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                                            {localized(f.label, locale)}
                                        </span>
                                        <span className="font-body-sm text-body-sm text-secondary">
                                            {localized(f.sub, locale)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Block id="konaklama" title={d.aboutTitle}>
                            {longDescription ? (
                                <div
                                    className="rich-text"
                                    dangerouslySetInnerHTML={{ __html: toHtml(longDescription) }}
                                />
                            ) : (
                                <p className="font-body-md text-body-md leading-relaxed text-secondary">
                                    {shortDescription}
                                </p>
                            )}
                        </Block>

                        {/* EKSTRA HİZMETLER BÖLÜMÜ */}
                        {bungalowExtras.length > 0 && (
                            <Block id="ekstralar" title="Ekstra Hizmetler">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {bungalowExtras.map((extra) => (
                                        <div
                                            key={extra.extraId}
                                            className="flex min-w-0 items-start gap-3 rounded-2xl bg-canvas-offwhite p-3"
                                        >
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-white text-crimson-vivid">
                                                <Icon name={extra.icon || "add_circle"} className="text-[20px]" />
                                            </div>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                                                    {localized(extra.title, locale)}
                                                </span>
                                                {localized(extra.description, locale) && (
                                                    <span className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                                        {localized(extra.description, locale)}
                                                    </span>
                                                )}
                                                <span className="mt-1 font-label-md text-label-md font-bold text-crimson-vivid">
                                                    {money(extra.price)}
                                                    <span className="ms-1 font-body-sm text-body-sm font-normal text-secondary">
                                                        / {extra.chargeMode === "Daily" ? "gece" : "adet"}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Block>
                        )}

                        {hasBreakfast && (
                            <div
                                id="kahvalti"
                                className="flex scroll-mt-32 flex-col gap-5 overflow-hidden rounded-3xl bg-canvas-offwhite p-4 shadow-sm sm:flex-row sm:items-center sm:p-6 md:p-8"
                            >
                                {breakfast?.image && (
                                    <div className="h-44 w-full shrink-0 overflow-hidden rounded-2xl sm:h-48 sm:w-1/3">
                                        <SafeImage
                                            src={mediaUrl(breakfast.image, "md")}
                                            alt={mediaAlt(breakfast.image, locale, localized(breakfast.title, locale))}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex w-full min-w-0 flex-col gap-2">
                                    <span className="inline-flex items-center gap-1.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid">
                                        <Icon name="restaurant" className="text-[16px]" />
                                        {d.breakfastEyebrow}
                                    </span>
                                    <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                        {breakfast ? localized(breakfast.title, locale) : d.breakfastIncluded}
                                    </h3>
                                    {(breakfast ? localized(breakfast.description, locale) : localized(bungalow.breakfastNote, locale)) && (
                                        <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                            {breakfast
                                                ? localized(breakfast.description, locale)
                                                : localized(bungalow.breakfastNote, locale)}
                                        </p>
                                    )}
                                    {breakfast?.tags?.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {breakfast.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="rounded-full bg-surface-white px-3 py-1 font-label-md text-label-md text-charcoal-dark"
                                                >
                                                    {localized(tag, locale)}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {amenities.length > 0 && (
                            <Block
                                id="olanaklar"
                                title={d.amenitiesTitle}
                                aside={tpl(d.amenitiesCount, { count: amenities.length })}
                            >
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                                    {amenities.map((a, i) => (
                                        <div key={i} className="flex min-w-0 items-center gap-3 rounded-xl p-2">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-offwhite text-crimson-vivid">
                                                <Icon name={a.icon} className="text-[22px]" />
                                            </div>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                                                    {localized(a.label, locale)}
                                                </span>
                                                {localized(a.value, locale) && (
                                                    <span className="font-body-sm text-body-sm text-secondary">
                                                        {localized(a.value, locale)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Block>
                        )}

                        {hasLocation && (
                            <Block id="harita" title={d.locationTitle}>
                                {localized(bungalow.locationNote, locale) && (
                                    <div className="mb-4 inline-flex items-start gap-2 rounded-2xl bg-canvas-offwhite px-4 py-3 font-body-sm text-body-sm text-charcoal-dark">
                                        <Icon name="near_me" className="mt-0.5 shrink-0 text-[18px] text-crimson-vivid" />
                                        <span>{localized(bungalow.locationNote, locale)}</span>
                                    </div>
                                )}
                                {bungalow.distances?.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                                        {bungalow.distances.map((dist, i) => (
                                            <div
                                                key={i}
                                                className="flex min-w-0 flex-col items-center rounded-2xl bg-canvas-offwhite p-3 text-center"
                                            >
                                                <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                                                    {localized(dist.place, locale)}
                                                </span>
                                                <span className="font-body-sm text-body-sm text-secondary">
                                                    {localized(dist.value, locale)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Block>
                        )}

                        {bungalow.rules?.length > 0 && (
                            <Block id="kurallar" title={d.rulesTitle}>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                    {bungalow.rules.map((r, i) => (
                                        <div key={i} className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 font-label-md text-label-md font-bold text-charcoal-dark">
                                                <Icon name={r.icon} className="shrink-0 text-[18px] text-crimson-vivid" />
                                                {localized(r.title, locale)}
                                            </div>
                                            {localized(r.text, locale) && (
                                                <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                                    {localized(r.text, locale)}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Block>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobil sabit alt CTA */}
            <div
                data-sticky-cta
                className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-variant bg-surface-white/95 px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(15,17,21,0.12)] backdrop-blur-lg lg:hidden"
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-col">
                        <span className="truncate font-label-uppercase text-label-uppercase text-secondary">
                            {tpl(d.totalNights, { nights: nightsValid ? nights : 0 })}
                        </span>
                        <span className="flex items-center gap-2 font-headline-sm text-headline-sm font-extrabold text-charcoal-dark">
                            {loading && (
                                <Icon name="progress_activity" className="animate-spin text-[16px] text-crimson-vivid" />
                            )}
                            {total != null ? money(total) : "—"}
                        </span>
                    </div>
                    <a
                        href={overCapacity ? "#" : whatsappHref ?? "#"}
                        target={overCapacity ? undefined : "_blank"}
                        rel={overCapacity ? undefined : "noopener noreferrer"}
                        aria-disabled={overCapacity}
                        onClick={(e) => overCapacity && e.preventDefault()}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-6 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider shadow-md transition-colors ${overCapacity
                                ? "cursor-not-allowed bg-surface-variant text-secondary opacity-60"
                                : "bg-primary-container text-on-primary active:scale-[0.98]"
                            }`}
                    >
                        <Icon name="chat" className="text-[18px]" />
                        <span>{overCapacity ? d.capacityBlocked : d.reserve}</span>
                    </a>
                </div>
            </div>
        </>
    );
}

function Block({ id, title, aside, children }) {
    return (
        <div id={id} className="scroll-mt-32 rounded-3xl bg-surface-white p-4 shadow-sm sm:p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="h-6 w-2 shrink-0 rounded-full bg-crimson-vivid" />
                    <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                        {title}
                    </h2>
                </div>
                {aside && (
                    <span className="shrink-0 font-label-md text-label-md font-semibold text-crimson-vivid">{aside}</span>
                )}
            </div>
            {children}
        </div>
    );
}

function AnchorPills({ sections }) {
    const [active, setActive] = useState(sections[0]?.id);
    const idsKey = sections.map((s) => s.id).join(",");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
        );

        idsKey.split(",").forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [idsKey]);

    if (sections.length < 2) return null;

    return (
        <div className="sticky top-20 z-30 -mx-4 mb-5 bg-surface/90 px-4 py-1.5 backdrop-blur-md md:mx-0 md:px-0">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-full bg-canvas-offwhite p-1.5 shadow-sm">
                {sections.map((s) => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 font-label-md text-label-md transition-all ${active === s.id
                                ? "bg-charcoal-dark text-white shadow-sm"
                                : "text-secondary hover:bg-surface-variant hover:text-charcoal-dark"
                            }`}
                    >
                        {s.label}
                    </a>
                ))}
            </div>
        </div>
    );
}