"use client";

import { useEffect, useMemo, useState } from "react";
import DateField from "@/components/ui/DateField";
import Icon from "@/components/ui/Icon";
import ImageGallery from "@/components/ui/ImageGallery";
import Link from "@/components/ui/LocalizedLink";
import { SITE, waHref } from "@/lib/constants";
import { plusDays, todayISO } from "@/lib/dates";
import { ApiError } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { dailyTourMessage } from "@/lib/whatsapp";
import { quoteDailyTour } from "@/services";
import {
    Card,
    Editorial,
    GuestCounter,
    Inclusions,
    Itinerary,
    QuickSpecs,
    TravelNotes,
} from "@/components/sections/TourDetailBlocks";

const MAX_ADULTS = 50;
const MAX_CHILDREN = 10;
const AGES = Array.from({ length: 18 }, (_, i) => i); // 0-17

const BADGE_TONES = {
    primary: "bg-crimson-vivid/10 text-crimson-vivid",
    neutral: "bg-canvas-offwhite text-charcoal-dark",
};

const fieldCls =
    "w-full cursor-pointer appearance-none rounded-2xl bg-canvas-offwhite py-3 ps-4 pe-10 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/30";

function errorMessage(error, fallback) {
    if (error instanceof ApiError && error.isValidationError()) return error.getAllMessages().join(" ");
    return fallback;
}

export default function DailyTourDetailClient({ tour, sessions = [] }) {
    const { t, tpl, locale } = useLanguage();
    const d = t.tourDetail;

    const title = localized(tour.title, locale);
    const money = (amount) => formatPrice(amount, tour.currency, locale);
    const hasSessions = sessions.length > 0;

    const [date, setDate] = useState(() => sessions.find((s) => s.seats > 0)?.date ?? "");
    const [adults, setAdults] = useState(2);
    const [ages, setAges] = useState([]); // çocuk yaşları, "" = henüz seçilmedi
    const [quote, setQuote] = useState({ status: "idle" });

    /* Seanssız turda yarın varsayılan (client'ta, hydration güvenliği) */
    useEffect(() => {
        if (!hasSessions) setDate((v) => v || plusDays(todayISO(), 1));
    }, [hasSessions]);

    const session = sessions.find((s) => s.date === date);
    const agesReady = ages.every((a) => a !== "");
    const ready = Boolean(date) && agesReady;
    const agesKey = ages.join(",");

    /* Fiyat: backend quote (değişince 0,4 sn bekleyip) */
    useEffect(() => {
        if (!ready) {
            setQuote({ status: "idle" });
            return;
        }

        let cancelled = false;
        setQuote((q) => ({ status: "loading", data: q.data }));

        const timer = setTimeout(async () => {
            try {
                const data = await quoteDailyTour(tour.slug, {
                    date,
                    adults,
                    childAges: ages.map(Number),
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
    }, [ready, tour.slug, date, adults, agesKey]);

    const q = quote.status === "ok" || quote.status === "loading" ? quote.data : null;
    const loading = quote.status === "loading";
    const unitPrice = q?.adultUnitPrice ?? session?.unitPrice ?? tour.defaultBasePrice;
    const guests = adults + ages.length;

    /* Çocuk yoksa ve henüz hesap gelmediyse tahmini toplam göster */
    const total = q ? q.total : ages.length === 0 && date ? adults * unitPrice : null;

    const whatsappHref = useMemo(
        () =>
            waHref(
                dailyTourMessage({
                    tourTitle: localized(tour.title, "tr"),
                    date,
                    adults,
                    childAges: ages.filter((a) => a !== "").map(Number),
                    total: q?.total,
                    currency: tour.currency,
                    locale,
                })
            ),
        [tour, date, adults, ages, q, locale]
    );

    const images = [tour.image, ...(tour.gallery ?? [])]
        .filter(Boolean)
        .filter((img, i, arr) => arr.findIndex((x) => x.id === img.id) === i);

    const longDescription = localized(tour.longDescription, locale);

    /* ───────── Rezervasyon paneli ───────── */
    const bookingPanel = (
        <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-4 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.08)] sm:p-6">
            {/* Fiyat başlığı */}
            <div className="flex flex-col gap-1.5 rounded-2xl bg-charcoal-dark p-4 text-white shadow-md sm:p-5">
                <span className="font-label-uppercase text-label-uppercase text-white/70">{d.fromPrice}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                        {money(unitPrice)}
                    </span>
                    <span className="font-body-sm text-body-sm text-white/70">{d.perPerson}</span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-white/75">
                    <Icon name="verified" className="text-[14px] text-crimson-vivid" />
                    <span>{d.inclusion}</span>
                </div>
            </div>

            {/* Tarih */}
            <div className="flex flex-col gap-2">
                <span className="font-label-uppercase text-label-uppercase font-bold text-secondary">
                    {d.dateLabel}
                </span>

                {hasSessions ? (
                    <div className="relative">
                        <select
                            aria-label={d.dateLabel}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={fieldCls}
                        >
                            {date === "" && (
                                <option value="" disabled>
                                    {d.pickDate}
                                </option>
                            )}
                            {sessions.map((s) => {
                                const text = formatDate(s.date, locale);
                                return (
                                    <option key={s.date} value={s.date} disabled={s.seats === 0}>
                                        {s.seats === 0
                                            ? tpl(d.sessionFull, { date: text })
                                            : tpl(d.sessionOption, {
                                                date: text,
                                                price: money(s.unitPrice ?? tour.defaultBasePrice),
                                                seats: s.seats,
                                            })}
                                    </option>
                                );
                            })}
                        </select>
                        <Icon
                            name="expand_more"
                            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
                        />
                    </div>
                ) : (
                    <>
                        <DateField
                            required
                            value={date}
                            min={plusDays(todayISO(), 0)}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full cursor-pointer rounded-2xl bg-canvas-offwhite px-4 py-3 font-label-md text-label-md font-semibold text-charcoal-dark"
                        />
                        <p className="font-body-sm text-body-sm text-secondary">{d.anyDateHint}</p>
                    </>
                )}

                {session && session.seats > 0 && session.seats <= 5 && (
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-500/15 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-amber-700">
                        <Icon name="bolt" className="text-[14px]" />
                        {tpl(d.lastSeats, { seats: session.seats })}
                    </span>
                )}
            </div>

            {/* Kişi sayıları */}
            <div className="flex flex-col gap-3">
                <GuestCounter
                    label={d.adults}
                    sub={d.adultsSub}
                    count={adults}
                    onDec={() => setAdults((n) => Math.max(1, n - 1))}
                    onInc={() => setAdults((n) => Math.min(MAX_ADULTS, n + 1))}
                    decLabel={`${d.adults}: ${d.decrease}`}
                    incLabel={`${d.adults}: ${d.increase}`}
                />

                <div className="flex flex-col gap-2 rounded-2xl bg-canvas-offwhite p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <span className="block font-label-md text-label-md font-bold text-charcoal-dark">
                                {d.children}
                            </span>
                            <span className="block font-body-sm text-body-sm text-secondary">{d.childrenSub}</span>
                        </div>
                        {ages.length < MAX_CHILDREN && (
                            <button
                                type="button"
                                onClick={() => setAges((a) => [...a, ""])}
                                className="flex shrink-0 items-center gap-1 rounded-full bg-surface-white px-3.5 py-2 font-label-md text-label-md font-semibold text-charcoal-dark shadow-sm transition-colors hover:bg-crimson-vivid hover:text-white active:scale-95"
                            >
                                <Icon name="add" className="text-[16px]" />
                                {d.addChild}
                            </button>
                        )}
                    </div>

                    {ages.map((age, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="relative min-w-0 flex-1">
                                <select
                                    aria-label={tpl(d.childAge, { n: i + 1 })}
                                    value={age}
                                    onChange={(e) =>
                                        setAges((list) => list.map((x, idx) => (idx === i ? e.target.value : x)))
                                    }
                                    className="w-full cursor-pointer appearance-none rounded-xl bg-surface-white py-2.5 ps-3 pe-9 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/30"
                                >
                                    <option value="" disabled>
                                        {tpl(d.childAge, { n: i + 1 })} · {d.agePlaceholder}
                                    </option>
                                    {AGES.map((a) => (
                                        <option key={a} value={a}>
                                            {tpl(d.ageValue, { age: a })}
                                        </option>
                                    ))}
                                </select>
                                <Icon
                                    name="expand_more"
                                    className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setAges((list) => list.filter((_, idx) => idx !== i))}
                                aria-label={d.removeChild}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-white text-secondary shadow-sm transition-colors hover:bg-crimson-vivid/10 hover:text-crimson-vivid"
                            >
                                <Icon name="close" className="text-[18px]" />
                            </button>
                        </div>
                    ))}

                    {!agesReady && (
                        <p className="font-body-sm text-body-sm text-crimson-vivid">{d.ageHint}</p>
                    )}
                </div>
            </div>

            {/* Fiyat dökümü (backend hesabı) */}
            <div className="flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4" aria-busy={loading}>
                {quote.status === "error" && (
                    <p className="font-body-sm text-body-sm text-crimson-vivid">{quote.message}</p>
                )}

                {q && (
                    <>
                        <div className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                            <span className="text-secondary">
                                {tpl(d.adultsLine, { count: q.adults, price: money(q.adultUnitPrice) })}
                                {q.priceLabel && localized(q.priceLabel, locale) && (
                                    <span className="block text-[11px] text-secondary/70">
                                        {localized(q.priceLabel, locale)}
                                    </span>
                                )}
                            </span>
                            <span className="shrink-0 font-semibold text-charcoal-dark">{money(q.adultsTotal)}</span>
                        </div>

                        {q.children.map((c, i) => (
                            <div key={i} className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                                <span className="text-secondary">
                                    {tpl(d.childLine, { age: c.age })}
                                    {c.label && localized(c.label, locale) && (
                                        <span className="block text-[11px] text-secondary/70">
                                            {localized(c.label, locale)}
                                        </span>
                                    )}
                                </span>
                                <span className="shrink-0 font-semibold text-charcoal-dark">{money(c.unitPrice)}</span>
                            </div>
                        ))}
                    </>
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
                    href={whatsappHref ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container py-4 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-all hover:scale-[1.01] hover:bg-crimson-vivid active:scale-[0.98]"
                >
                    <Icon name="chat" className="text-[22px]" />
                    <span>{d.whatsapp}</span>
                </a>
                <a
                    href={SITE.phoneHref}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal-dark py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-sm transition-colors hover:bg-charcoal-surface"
                >
                    <Icon name="call" className="text-[18px]" />
                    <span dir="ltr">{SITE.phone}</span>
                </a>
            </div>

            {/* İade */}
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/5 p-4">
                <Icon name="verified_user" className="mt-0.5 shrink-0 text-[22px] text-emerald-600" />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-label-uppercase text-label-uppercase font-bold text-emerald-700">
                        {d.refundTitle}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">{d.refundText}</span>
                </div>
            </div>

            {/* Ajans */}
            <div className="border-t border-surface-variant pt-4 text-center font-body-sm text-body-sm text-secondary">
                <p className="font-medium">{tpl(d.agency, { no: SITE.tursabNo })}</p>
                <p className="mt-0.5">{d.supportNote}</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-6">
                {/* Breadcrumb */}
                <nav
                    aria-label={d.breadcrumbLabel}
                    className="no-scrollbar mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
                >
                    <Link href="/" className="transition-colors hover:text-crimson-vivid">
                        {d.home}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <Link href="/gunubirlik-turlar" className="transition-colors hover:text-crimson-vivid">
                        {d.dailyTours}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <span className="font-semibold text-charcoal-dark">{title}</span>
                </nav>

                {/* Başlık + rozetler */}
                <div className="mb-4 flex flex-col gap-3">
                    {tour.badges?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {tour.badges.map((b, i) => (
                                <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase font-bold ${BADGE_TONES[b.tone] || BADGE_TONES.neutral
                                        }`}
                                >
                                    <Icon name={b.icon} className="text-[14px]" />
                                    {localized(b.label, locale)}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="break-words font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                        {title}
                    </h1>
                </div>

                {/* Rota (yatay kaydırılır) */}
                {tour.routePills?.length > 0 && (
                    <div className="no-scrollbar -mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                        <span className="shrink-0 font-label-uppercase text-label-uppercase font-bold tracking-wider text-secondary">
                            {d.route}
                        </span>
                        {tour.routePills.map((p, i) => (
                            <span key={i} className="flex shrink-0 items-center gap-2">
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-label-md text-label-md font-semibold shadow-sm ${p.highlight
                                        ? "bg-crimson-vivid text-on-primary"
                                        : "bg-surface-white text-charcoal-dark"
                                        }`}
                                >
                                    {p.icon && <Icon name={p.icon} className="text-[14px]" />}
                                    {localized(p.label, locale)}
                                </span>
                                {i < tour.routePills.length - 1 && (
                                    <Icon
                                        name="arrow_forward"
                                        className="text-[14px] text-secondary/60 rtl:-scale-x-100"
                                    />
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* Galeri */}
                <ImageGallery images={images} title={title} />

                {/* Hızlı bilgiler */}
                <QuickSpecs specs={tour.quickSpecs} />

                {/* İçerik + panel: mobilde panel önce, masaüstünde sağda sabit */}
                <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-x-8">
                    <div className="order-first min-w-0 lg:order-none lg:col-span-4 lg:col-start-9 lg:row-start-1">
                        <div className="lg:sticky lg:top-28">{bookingPanel}</div>
                    </div>

                    <div className="flex min-w-0 flex-col gap-5 lg:col-span-8 lg:col-start-1 lg:row-start-1">
                        {longDescription && (
                            <Card>
                                <h2 className="mb-3 font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                    {d.about}
                                </h2>
                                <div
                                    className="font-body-md text-body-md leading-relaxed text-secondary [&_a]:text-crimson-vivid [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ps-5"
                                    dangerouslySetInnerHTML={{ __html: longDescription }}
                                />
                            </Card>
                        )}

                        {tour.itinerary?.length > 0 && (
                            <Itinerary items={tour.itinerary} eyebrow={d.itineraryEyebrow} title={d.itineraryTitle} />
                        )}

                        {tour.editorial && <Editorial editorial={tour.editorial} />}
                        {tour.itinerary?.length > 0 && <Itinerary items={tour.itinerary} />}
                        {tour.inclusions && <Inclusions inclusions={tour.inclusions} />}
                        {tour.travelNotes?.length > 0 && <TravelNotes notes={tour.travelNotes} />}
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
                            {tpl(d.totalGuests, { count: guests })}
                        </span>
                        <span className="flex items-center gap-2 font-headline-sm text-headline-sm font-extrabold text-charcoal-dark">
                            {loading && (
                                <Icon name="progress_activity" className="animate-spin text-[16px] text-crimson-vivid" />
                            )}
                            {total != null ? money(total) : "—"}
                        </span>
                    </div>
                    <a
                        href={whatsappHref ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-primary-container px-6 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-colors active:scale-[0.98]"
                    >
                        <Icon name="chat" className="text-[18px]" />
                        <span>{d.reserve}</span>
                    </a>
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

function Card({ children, className = "bg-surface-white shadow-sm" }) {
    return <div className={`flex flex-col gap-4 rounded-3xl p-4 sm:p-6 md:p-8 ${className}`}>{children}</div>;
}

function SectionTitle({ eyebrow, title }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid">
                {eyebrow}
            </span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                {title}
            </h3>
        </div>
    );
}

function GuestCounter({ label, sub, count, onDec, onInc, decLabel, incLabel }) {
    const btn =
        "flex h-10 w-10 items-center justify-center rounded-full bg-surface-white text-[20px] font-bold text-charcoal-dark shadow-sm transition-all hover:bg-crimson-vivid hover:text-white active:scale-90";

    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-offwhite p-3">
            <div className="min-w-0">
                <span className="block font-label-md text-label-md font-bold text-charcoal-dark">{label}</span>
                <span className="block font-body-sm text-body-sm text-secondary">{sub}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={onDec} aria-label={decLabel} className={btn}>
                    −
                </button>
                <span className="w-7 text-center font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {count}
                </span>
                <button type="button" onClick={onInc} aria-label={incLabel} className={btn}>
                    +
                </button>
            </div>
        </div>
    );
}

function Editorial({ editorial }) {
    const { locale } = useLanguage();
    const eyebrow = localized(editorial.eyebrow, locale);
    const paragraphs = (editorial.paragraphs ?? []).map((p) => localized(p, locale)).filter(Boolean);
    const highlights = (editorial.highlights ?? []).map((h) => localized(h, locale)).filter(Boolean);

    return (
        <Card>
            {eyebrow && (
                <div className="flex items-center gap-2 font-label-uppercase text-label-uppercase font-bold text-crimson-vivid">
                    {editorial.eyebrowIcon && <Icon name={editorial.eyebrowIcon} className="text-[18px]" />}
                    <span>{eyebrow}</span>
                </div>
            )}

            <h2 className="font-headline-sm text-headline-sm font-bold tracking-tight text-charcoal-dark md:font-headline-md md:text-headline-md">
                {localized(editorial.title, locale)}
            </h2>

            <div className="flex flex-col gap-3">
                {paragraphs.map((p, i) => (
                    <p key={i} className="font-body-md text-body-md leading-relaxed text-secondary">
                        {p}
                    </p>
                ))}
            </div>

            {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {highlights.map((h, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md text-charcoal-dark"
                        >
                            <Icon name="verified" className="text-[14px] text-crimson-vivid" />
                            {h}
                        </span>
                    ))}
                </div>
            )}
        </Card>
    );
}

function Itinerary({ items }) {
    const { t, locale } = useLanguage();
    const d = t.tourDetail;

    return (
        <Card>
            <SectionTitle eyebrow={d.itineraryEyebrow} title={d.itineraryTitle} />

            <ol className="relative space-y-3 ps-8 before:absolute before:bottom-3 before:start-[14px] before:top-3 before:w-0.5 before:bg-canvas-offwhite sm:space-y-4">
                {items.map((item, i) => (
                    <li key={i} className="relative">
                        <span
                            className={`absolute -start-8 top-1 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md ${item.isFinal ? "bg-emerald-600" : "bg-crimson-vivid"
                                }`}
                        >
                            <Icon name={item.icon} className="text-[14px]" />
                        </span>

                        <div className="rounded-2xl bg-canvas-offwhite p-3.5 sm:p-4">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                <span className="min-w-0 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                    {localized(item.title, locale)}
                                </span>
                                <span
                                    dir="ltr"
                                    className={`rounded-full bg-surface-white px-3 py-0.5 font-label-md text-label-md font-bold shadow-sm ${item.isFinal ? "text-emerald-600" : "text-crimson-vivid"
                                        }`}
                                >
                                    {item.time}
                                </span>
                            </div>
                            {item.description && (
                                <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                    {localized(item.description, locale)}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </Card>
    );
}

function Inclusions({ inclusions }) {
    const { t, locale } = useLanguage();
    const d = t.tourDetail;
    const included = inclusions.included ?? [];
    const excluded = inclusions.excluded ?? [];
    if (included.length === 0 && excluded.length === 0) return null;

    return (
        <Card>
            <SectionTitle eyebrow={d.inclusionEyebrow} title={d.inclusionTitle} />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                {included.length > 0 && (
                    <div className="rounded-2xl bg-emerald-500/5 p-4 sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                                <Icon name="check" className="text-[16px]" />
                            </span>
                            <span className="font-headline-sm text-headline-sm font-bold text-emerald-700">
                                {d.included}
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                            {included.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 px-1 py-1 font-body-sm text-body-sm text-charcoal-dark"
                                >
                                    <Icon
                                        name="check_circle"
                                        fill
                                        className="mt-0.5 shrink-0 text-[18px] text-emerald-600"
                                    />
                                    <span>{localized(item.text, locale)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {excluded.length > 0 && (
                    <div className="rounded-2xl bg-crimson-vivid/5 p-4 sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crimson-vivid text-white">
                                <Icon name="close" className="text-[16px]" />
                            </span>
                            <span className="font-headline-sm text-headline-sm font-bold text-crimson-vivid">
                                {d.excluded}
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                            {excluded.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 px-1 py-1 font-body-sm text-body-sm text-charcoal-dark"
                                >
                                    <Icon name="cancel" className="mt-0.5 shrink-0 text-[18px] text-crimson-vivid" />
                                    <span>{localized(item.text, locale)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
}

function TravelNotes({ notes }) {
    const { t, locale } = useLanguage();

    return (
        <Card className="bg-canvas-offwhite">
            <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                <Icon name="lightbulb" className="shrink-0 text-[22px] text-crimson-vivid" />
                <span>{t.tourDetail.notesTitle}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl bg-surface-white p-3.5 sm:p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson-vivid/10">
                            <Icon name={n.icon || "info"} className="text-[20px] text-crimson-vivid" />
                        </span>
                        <span className="min-w-0 font-body-sm text-body-sm leading-relaxed text-secondary">
                            {localized(n.text, locale)}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}