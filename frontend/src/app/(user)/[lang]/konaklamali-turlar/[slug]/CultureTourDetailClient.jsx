"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Card,
    Editorial,
    GuestCounter,
    Inclusions,
    Itinerary,
    QuickSpecs,
    TravelNotes,
} from "@/components/sections/TourDetailBlocks";
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
import { cultureTourMessage } from "@/lib/whatsapp";
import { quoteCultureTour } from "@/services";
import { toHtml } from "@/lib/richText";

const MAX_ADULTS = 50;
const MAX_CHILDREN = 10;
const AGES = Array.from({ length: 18 }, (_, i) => i); // 0-17

const BADGE_TONES = {
    primary: "bg-crimson-vivid/10 text-crimson-vivid",
    neutral: "bg-canvas-offwhite text-charcoal-dark",
};

const selectCls =
    "w-full cursor-pointer appearance-none rounded-2xl bg-canvas-offwhite py-3 ps-4 pe-10 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/30";

function errorMessage(error, fallback) {
    if (error instanceof ApiError && error.isValidationError()) return error.getAllMessages().join(" ");
    return fallback;
}

export default function CultureTourDetailClient({ tour, sessions = [], options = [] }) {
    const { t, tpl, locale } = useLanguage();
    // Kültür bloğunda olmayan anahtarlar günübirlik/detay bloğundan gelir
    const d = { ...t.tourDetail, ...t.cultureDetail };

    const title = localized(tour.title, locale);
    const money = (amount) => formatPrice(amount, tour.currency, locale);
    const hasSessions = sessions.length > 0;

    const [date, setDate] = useState(() => sessions.find((s) => s.seats > 0)?.date ?? "");
    const [accommodationId, setAccommodationId] = useState(options[0]?.accommodationTypeId ?? "");
    const [adults, setAdults] = useState(2);
    const [ages, setAges] = useState([]); // çocuk yaşları, "" = henüz seçilmedi
    const [quote, setQuote] = useState({ status: "idle" });

    /* Seanssız turda yarın varsayılan (client'ta, hydration güvenliği) */
    useEffect(() => {
        if (!hasSessions) setDate((v) => v || plusDays(todayISO(), 1));
    }, [hasSessions]);

    const option = options.find((o) => o.accommodationTypeId === accommodationId);
    const session = sessions.find((s) => s.date === date);
    const agesReady = ages.every((a) => a !== "");
    const ready = Boolean(date) && Boolean(accommodationId) && agesReady;
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
                const data = await quoteCultureTour(tour.slug, {
                    date,
                    accommodationTypeId: accommodationId,
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
    }, [ready, tour.slug, date, accommodationId, adults, agesKey]);

    const q = quote.status === "ok" || quote.status === "loading" ? quote.data : null;
    const loading = quote.status === "loading";
    const unitPrice = q?.adultUnitPrice ?? option?.pricePerPerson ?? tour.defaultBasePrice;
    const guests = adults + ages.length;

    /* Çocuk yoksa ve henüz hesap gelmediyse tahmini toplam göster */
    const total = q ? q.total : ages.length === 0 && date && option ? adults * unitPrice : null;

    const whatsappHref = useMemo(
        () =>
            waHref(
                cultureTourMessage({
                    tourTitle: localized(tour.title, "tr"),
                    date,
                    accommodation: localized(option?.label, "tr"),
                    adults,
                    childAges: ages.filter((a) => a !== "").map(Number),
                    total: q?.total,
                    currency: tour.currency,
                    locale,
                })
            ),
        [tour, date, option, adults, ages, q, locale]
    );

    const images = [tour.image, ...(tour.gallery ?? [])]
        .filter(Boolean)
        .filter((img, i, arr) => arr.findIndex((x) => x.id === img.id) === i);

    const longDescription = localized(tour.longDescription, locale);
    const shortDescription = localized(tour.description, locale);

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

            {/* Konaklama tipi */}
            <div className="flex flex-col gap-2">
                <span className="font-label-uppercase text-label-uppercase font-bold text-secondary">
                    {d.accommodationLabel}
                </span>

                {options.length === 0 ? (
                    <p className="rounded-2xl bg-crimson-vivid/10 px-3 py-2.5 font-body-sm text-body-sm text-crimson-vivid">
                        {d.noOptions}
                    </p>
                ) : (
                    <div role="radiogroup" aria-label={d.accommodationLabel} className="flex flex-col gap-2">
                        {options.map((o) => {
                            const selected = o.accommodationTypeId === accommodationId;
                            const description = localized(o.description, locale);
                            return (
                                <button
                                    key={o.accommodationTypeId}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => setAccommodationId(o.accommodationTypeId)}
                                    className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-start transition-colors ${selected
                                        ? "border-crimson-vivid bg-crimson-vivid/5"
                                        : "border-transparent bg-canvas-offwhite hover:border-surface-variant"
                                        }`}
                                >
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-white text-crimson-vivid shadow-sm">
                                        <Icon name={o.icon || "hotel"} className="text-[20px]" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block font-label-md text-label-md font-bold text-charcoal-dark">
                                            {localized(o.label, locale)}
                                        </span>
                                        {description && (
                                            <span className="line-clamp-2 block font-body-sm text-body-sm text-secondary">
                                                {description}
                                            </span>
                                        )}
                                    </span>
                                    <span className="shrink-0 text-end">
                                        <span className="block font-label-md text-label-md font-bold text-crimson-vivid">
                                            {money(o.pricePerPerson)}
                                        </span>
                                        <span className="block text-[10px] text-secondary">{d.perPerson}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Kalkış tarihi */}
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
                            className={selectCls}
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
                                            : tpl(d.sessionOption, { date: text, seats: s.seats })}
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
                            min={todayISO()}
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

                    {!agesReady && <p className="font-body-sm text-body-sm text-crimson-vivid">{d.ageHint}</p>}
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
                                <span className="block text-[11px] text-secondary/70">
                                    {localized(q.accommodationType?.label, locale)}
                                    {q.nights > 0 && ` · ${tpl(d.nightsBadge, { n: q.nights })}`}
                                </span>
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
                    <Link href="/konaklamali-turlar" className="transition-colors hover:text-crimson-vivid">
                        {d.cultureTours}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <span className="font-semibold text-charcoal-dark">{title}</span>
                </nav>

                {/* Başlık + rozetler */}
                <div className="mb-4 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {tour.nights > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal-dark px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-white">
                                <Icon name="nights_stay" className="text-[14px]" />
                                {tpl(d.nightsBadge, { n: tour.nights })}
                            </span>
                        )}
                        {tour.badges?.map((b, i) => (
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
                        {(longDescription || shortDescription) && (
                            <Card>
                                <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                    {d.about}
                                </h2>
                                {longDescription ? (
                                    <div
                                        className="rich-text font-body-md text-body-md leading-relaxed text-secondary [&_a]:text-crimson-vivid [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ps-5"
                                        dangerouslySetInnerHTML={{ __html: toHtml(longDescription) }}
                                    />
                                ) : (
                                    <p className="font-body-md text-body-md leading-relaxed text-secondary">
                                        {shortDescription}
                                    </p>
                                )}
                            </Card>
                        )}

                        {tour.editorial && <Editorial editorial={tour.editorial} />}
                        {tour.itinerary?.length > 0 && (
                            <Itinerary items={tour.itinerary} eyebrow={d.itineraryEyebrow} title={d.itineraryTitle} />
                        )}
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