"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import Lightbox from "@/components/ui/Lightbox";
import { getCultureTourDetail } from "@/lib/mockData";

const fmt = (n) => Number(n).toLocaleString("tr-TR");

const BADGE_TONES = {
    primary: "bg-crimson-vivid/10 text-crimson-vivid",
    neutral: "bg-canvas-offwhite text-charcoal-dark",
};

export default function CultureTourDetailPage({ params }) {
    const resolved = typeof params?.then === "function" ? use(params) : params;
    const slug = resolved?.slug;

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const detail = useMemo(() => getCultureTourDetail(slug), [slug]);

    const [mounted, setMounted] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);

    useEffect(() => {
        setMounted(true);
        if (detail?.booking?.sessions?.length) {
            setSelectedSessionId(detail.booking.sessions[0].id);
        }
    }, [detail]);

    if (!detail) notFound();

    const {
        tour,
        badges,
        routePills,
        gallery,
        quickSpecs,
        editorial,
        itinerary,
        inclusions,
        travelNotes,
        booking,
        agency,
    } = detail;

    const selectedSession = useMemo(
        () =>
            booking.sessions.find((s) => s.id === selectedSessionId) ||
            booking.sessions[0],
        [booking.sessions, selectedSessionId]
    );

    const adultPrice = selectedSession?.price || booking.basePrice;
    const childPrice = Math.round(
        adultPrice * (1 - booking.childDiscountPercent / 100)
    );

    const adultTotal = adults * adultPrice;
    const childTotal = children * childPrice;
    const grandTotal = adultTotal + childTotal;

    const whatsappHref = useMemo(() => {
        if (!mounted) return "https://wa.me/908503096100";
        const lines = [
            "Merhaba, konaklamalı kültür turu rezervasyonu yapmak istiyorum.",
            "",
            `• Tur: ${tour.title}`,
            `• Kalkış: ${selectedSession?.date || "-"}`,
            `• Yetişkin: ${adults}`,
            children > 0 ? `• Çocuk: ${children}` : null,
            `• Toplam: ₺${fmt(grandTotal)}`,
        ].filter(Boolean);
        return `https://wa.me/908503096100?text=${encodeURIComponent(lines.join("\n"))}`;
    }, [mounted, tour.title, selectedSession, adults, children, grandTotal]);

    const openLightbox = (i) => {
        setLightboxIndex(i);
        setLightboxOpen(true);
    };

    return (
        <>
            <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-6">
                {/* BREADCRUMB */}
                <nav
                    aria-label="Ekmek kırıntısı"
                    className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
                >
                    <Link href="/" className="transition-colors hover:text-crimson-vivid">
                        Anasayfa
                    </Link>
                    <Icon name="chevron_right" className="text-[14px]" />
                    <Link
                        href="/konaklamali-turlar"
                        className="transition-colors hover:text-crimson-vivid"
                    >
                        Konaklamalı Turlar
                    </Link>
                    <Icon name="chevron_right" className="text-[14px]" />
                    <span className="font-semibold text-charcoal-dark">{tour.title}</span>
                </nav>

                {/* BAŞLIK + BADGE'LER */}
                <div className="mb-5 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        {badges.map((b) => (
                            <span
                                key={b.label}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase font-bold ${BADGE_TONES[b.tone] || BADGE_TONES.neutral
                                    }`}
                            >
                                <Icon
                                    name={b.icon}
                                    fill={b.icon === "star"}
                                    className="text-[14px]"
                                />
                                {b.label}
                            </span>
                        ))}
                    </div>

                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                        {tour.title}
                    </h1>
                </div>

                {/* ROTA PILL'LERİ */}
                <div className="no-scrollbar -mx-4 mb-6 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                    <span className="shrink-0 font-label-uppercase text-label-uppercase font-bold tracking-wider text-secondary">
                        Rota
                    </span>
                    {routePills.map((p, i) => (
                        <span key={p.label} className="flex shrink-0 items-center gap-2">
                            <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 font-label-md text-label-md font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${p.highlight
                                        ? "bg-crimson-vivid text-on-primary hover:bg-crimson-vivid/90"
                                        : "bg-surface-white text-charcoal-dark hover:bg-canvas-offwhite"
                                    }`}
                            >
                                {p.icon && <Icon name={p.icon} className="text-[14px]" />}
                                {p.label}
                            </span>
                            {i < routePills.length - 1 && (
                                <Icon
                                    name="arrow_forward"
                                    className="text-[14px] text-secondary/60"
                                />
                            )}
                        </span>
                    ))}
                </div>

                {/* GALERİ */}
                <Gallery images={gallery} onImageClick={openLightbox} />

                {/* QUICK SPECS */}
                <QuickSpecs specs={quickSpecs} />

                {/* 2 KOLON */}
                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        <EditorialBlock editorial={editorial} />
                        <ItineraryBlock items={itinerary} />
                        <InclusionsBlock
                            included={inclusions.included}
                            excluded={inclusions.excluded}
                        />
                        <TravelNotesBlock notes={travelNotes} />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <BookingPanel
                                tour={tour}
                                agency={agency}
                                sessions={booking.sessions}
                                selectedSession={selectedSession}
                                setSelectedSessionId={setSelectedSessionId}
                                adults={adults}
                                setAdults={setAdults}
                                children={children}
                                setChildren={setChildren}
                                adultPrice={adultPrice}
                                childPrice={childPrice}
                                adultTotal={adultTotal}
                                childTotal={childTotal}
                                grandTotal={grandTotal}
                                whatsappHref={whatsappHref}
                                mounted={mounted}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX */}
            <Lightbox
                images={gallery}
                index={lightboxIndex}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onIndexChange={setLightboxIndex}
            />

            {/* MOBİL SABİT ALT CTA */}
            {mounted && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-variant bg-surface-white/95 px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(15,17,21,0.12)] backdrop-blur-lg lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="font-label-uppercase text-label-uppercase text-secondary">
                                Toplam · {adults + children} kişi
                            </span>
                            <span className="font-headline-sm text-headline-sm font-extrabold text-charcoal-dark">
                                ₺{fmt(grandTotal)}
                            </span>
                        </div>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-6 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-colors active:scale-[0.98]"
                        >
                            <Icon name="chat" className="text-[18px]" />
                            <span>Rezervasyon</span>
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

/* ─────────────────────────────────────────────
   GALERİ
   ───────────────────────────────────────────── */

function Gallery({ images, onImageClick }) {
    const [hero, ...rest] = images;

    return (
        <div className="grid grid-cols-1 gap-3 md:h-[500px] md:grid-cols-12">
            <button
                type="button"
                onClick={() => onImageClick?.(0)}
                className="group relative h-[280px] cursor-zoom-in overflow-hidden rounded-3xl shadow-sm md:col-span-7 md:h-full"
            >
                <SafeImage
                    src={hero.src}
                    alt={hero.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-white/90 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-charcoal-dark shadow-sm backdrop-blur-md transition-transform group-hover:scale-105">
                        <Icon
                            name="photo_camera"
                            fill
                            className="text-[14px] text-crimson-vivid"
                        />
                        Öne Çıkan Ana Durak
                    </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-left text-white">
                    <p className="font-headline-sm text-headline-sm font-bold drop-shadow-md md:font-headline-md md:text-headline-md">
                        {hero.title}
                    </p>
                    <p className="line-clamp-1 font-body-sm text-body-sm text-white/90">
                        {hero.subtitle}
                    </p>
                </div>
            </button>

            <div className="grid h-auto grid-cols-2 gap-3 md:col-span-5 md:h-full">
                {rest[0] && (
                    <button
                        type="button"
                        onClick={() => onImageClick?.(1)}
                        className="group relative col-span-2 h-[140px] cursor-zoom-in overflow-hidden rounded-2xl shadow-sm md:h-auto"
                    >
                        <SafeImage
                            src={rest[0].src}
                            alt={rest[0].title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-left text-white">
                            <p className="truncate font-headline-sm text-headline-sm font-bold">
                                {rest[0].title}
                            </p>
                            <p className="truncate font-body-sm text-body-sm text-white/80">
                                {rest[0].subtitle}
                            </p>
                        </div>
                    </button>
                )}

                {rest.slice(1, 3).map((img, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onImageClick?.(i + 2)}
                        className="group relative h-[140px] cursor-zoom-in overflow-hidden rounded-2xl shadow-sm md:h-auto"
                    >
                        <SafeImage
                            src={img.src}
                            alt={img.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-2 left-2 right-2 text-left text-white">
                            <p className="truncate font-label-md text-label-md font-bold">
                                {img.title}
                            </p>
                        </div>
                        {img.totalPhotos && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors group-hover:bg-black/30">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-white/90 px-3 py-1.5 font-label-md text-label-md font-semibold text-charcoal-dark shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
                                    <Icon
                                        name="grid_view"
                                        className="text-[14px] text-crimson-vivid"
                                    />
                                    <span>+{img.totalPhotos} Fotoğraf</span>
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   QUICK SPECS
   ───────────────────────────────────────────── */

function QuickSpecs({ specs }) {
    return (
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-surface-white p-4 shadow-sm md:grid-cols-5">
            {specs.map((s) => {
                const isEmerald = s.tone === "emerald";
                return (
                    <div
                        key={s.label}
                        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas-offwhite"
                    >
                        <span
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${isEmerald
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-crimson-vivid/10 text-crimson-vivid"
                                }`}
                        >
                            <Icon name={s.icon} className="text-[22px]" />
                        </span>
                        <div className="min-w-0">
                            <span className="block font-label-uppercase text-label-uppercase text-secondary">
                                {s.label}
                            </span>
                            <span
                                className={`block truncate font-headline-sm text-headline-sm font-bold ${isEmerald ? "text-emerald-600" : "text-charcoal-dark"
                                    }`}
                            >
                                {s.value}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ─────────────────────────────────────────────
   EDİTÖRYEL
   ───────────────────────────────────────────── */

function EditorialBlock({ editorial }) {
    return (
        <div className="flex flex-col gap-4 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2 font-label-uppercase text-label-uppercase font-bold text-crimson-vivid">
                <Icon name={editorial.eyebrowIcon} className="text-[18px]" />
                <span>{editorial.eyebrow}</span>
            </div>

            <h2 className="font-headline-sm text-headline-sm font-bold tracking-tight text-charcoal-dark md:font-headline-md md:text-headline-md">
                {editorial.title}
            </h2>

            <div className="flex flex-col gap-3">
                {editorial.paragraphs.map((p, i) => (
                    <p
                        key={i}
                        className="font-body-md text-body-md leading-relaxed text-secondary"
                    >
                        {p}
                    </p>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
                {editorial.highlights.map((h) => (
                    <span
                        key={h}
                        className="group inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md text-charcoal-dark transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-vivid/10 hover:shadow-sm"
                    >
                        <Icon
                            name="verified"
                            className="text-[14px] text-crimson-vivid transition-transform group-hover:scale-110"
                        />
                        {h}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   TİMELİNE
   ───────────────────────────────────────────── */

function ItineraryBlock({ items }) {
    return (
        <div className="flex flex-col gap-6 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-1">
                <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid">
                    Gün Gün Plan
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                    Konaklamalı Tur Programı
                </h3>
            </div>

            <ol className="relative space-y-4 pl-8 before:absolute before:bottom-3 before:left-[14px] before:top-3 before:w-0.5 before:bg-canvas-offwhite">
                {items.map((item, i) => {
                    const isFinal = item.final;
                    return (
                        <li key={i} className="relative">
                            <span
                                className={`absolute -left-8 top-1 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md ${isFinal ? "bg-emerald-600" : "bg-crimson-vivid"
                                    }`}
                            >
                                <Icon name={item.icon} className="text-[14px]" />
                            </span>

                            <div className="group relative overflow-hidden rounded-2xl bg-canvas-offwhite p-4 pl-5 transition-all duration-300 hover:bg-surface-variant/70 hover:shadow-sm">
                                <span
                                    aria-hidden="true"
                                    className={`absolute inset-y-3 left-0 w-[3px] origin-top scale-y-0 rounded-full transition-transform duration-300 group-hover:scale-y-100 ${isFinal ? "bg-emerald-600" : "bg-crimson-vivid"
                                        }`}
                                />

                                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                                        {item.title}
                                    </span>
                                    <span
                                        className={`rounded-full bg-surface-white px-3 py-0.5 font-label-md text-label-md font-bold shadow-sm transition-transform group-hover:scale-105 ${isFinal ? "text-emerald-600" : "text-crimson-vivid"
                                            }`}
                                    >
                                        {item.time}
                                    </span>
                                </div>
                                <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                    {item.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

/* ─────────────────────────────────────────────
   DAHİL / DAHİL DEĞİL
   ───────────────────────────────────────────── */

function InclusionsBlock({ included, excluded }) {
    return (
        <div className="flex flex-col gap-6 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-1">
                <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid">
                    Şeffaf Fiyatlandırma
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                    Dahil Olan &amp; Olmayan Hizmetler
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-emerald-500/5 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                            <Icon name="check" className="text-[16px]" />
                        </span>
                        <span className="font-headline-sm text-headline-sm font-bold text-emerald-700">
                            Fiyata Dahil
                        </span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                        {included.map((item, i) => (
                            <li
                                key={i}
                                className="group flex items-start gap-2 rounded-lg px-2 py-1.5 font-body-sm text-body-sm text-charcoal-dark transition-colors hover:bg-emerald-500/10"
                            >
                                <Icon
                                    name="check_circle"
                                    fill
                                    className="mt-0.5 shrink-0 text-[18px] text-emerald-600 transition-transform group-hover:scale-110"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="rounded-2xl bg-crimson-vivid/5 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crimson-vivid text-white">
                            <Icon name="close" className="text-[16px]" />
                        </span>
                        <span className="font-headline-sm text-headline-sm font-bold text-crimson-vivid">
                            Fiyata Dahil Değil
                        </span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                        {excluded.map((item, i) => (
                            <li
                                key={i}
                                className="group flex items-start gap-2 rounded-lg px-2 py-1.5 font-body-sm text-body-sm text-charcoal-dark transition-colors hover:bg-crimson-vivid/10"
                            >
                                <Icon
                                    name="cancel"
                                    className="mt-0.5 shrink-0 text-[18px] text-crimson-vivid transition-transform group-hover:scale-110"
                                />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   SEYAHAT NOTLARI
   ───────────────────────────────────────────── */

function TravelNotesBlock({ notes }) {
    return (
        <div className="flex flex-col gap-4 rounded-3xl bg-canvas-offwhite p-6 md:p-8">
            <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                <Icon name="lightbulb" className="text-[22px] text-crimson-vivid" />
                <span>Katılımcılar İçin Önemli Tavsiyeler</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notes.map((n, i) => (
                    <div
                        key={i}
                        className="group flex items-start gap-3 rounded-2xl bg-surface-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                    >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson-vivid/10 transition-colors group-hover:bg-crimson-vivid">
                            <Icon
                                name={n.icon}
                                className="text-[20px] text-crimson-vivid transition-colors group-hover:text-white"
                            />
                        </span>
                        <span className="font-body-sm text-body-sm leading-relaxed text-secondary transition-colors group-hover:text-charcoal-dark">
                            {n.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   REZERVASYON PANELİ
   ───────────────────────────────────────────── */

function BookingPanel({
    tour,
    agency,
    sessions,
    selectedSession,
    setSelectedSessionId,
    adults,
    setAdults,
    children,
    setChildren,
    adultPrice,
    childPrice,
    adultTotal,
    childTotal,
    grandTotal,
    whatsappHref,
    mounted,
}) {
    const incDec = (setter, current, delta, min, max) => {
        const next = Math.max(min, Math.min(max, current + delta));
        setter(next);
    };

    return (
        <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.08)] md:p-6">
            {/* FİYAT BAŞLIĞI */}
            <div className="flex flex-col gap-1.5 rounded-2xl bg-charcoal-dark p-5 text-white shadow-md">
                <span className="font-label-uppercase text-label-uppercase text-white/70">
                    Başlayan Fiyatlarla
                </span>
                <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                        ₺{fmt(adultPrice)}
                    </span>
                    <span className="font-body-sm text-body-sm text-white/70">
                        / Kişi Başı
                    </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[12px] text-white/75">
                    <Icon name="verified" className="text-[14px] text-crimson-vivid" />
                    <span>Konaklama &amp; Ulaşım Dahil</span>
                </div>
            </div>

            {/* KALKIŞ SEÇİMİ */}
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="tour-session"
                    className="font-label-uppercase text-label-uppercase font-bold text-secondary"
                >
                    Kalkış Tarihi Seçin
                </label>
                <div className="relative">
                    <select
                        id="tour-session"
                        value={selectedSession?.id || ""}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full cursor-pointer appearance-none rounded-2xl bg-canvas-offwhite py-3 pl-4 pr-10 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                    >
                        {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.date} — ₺{fmt(s.price)} ({s.seats} Kontenjan)
                            </option>
                        ))}
                    </select>
                    <Icon
                        name="expand_more"
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
                    />
                </div>
                {selectedSession?.isLastSeats && (
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-500/15 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-amber-700">
                        <Icon name="bolt" className="text-[14px]" />
                        Son {selectedSession.seats} kontenjan
                    </span>
                )}
            </div>

            {/* SAYAÇLAR */}
            <div className="flex flex-col gap-3">
                <GuestCounter
                    label="Yetişkin"
                    sub="12 yaş ve üzeri"
                    count={adults}
                    onDec={() => incDec(setAdults, adults, -1, 1, 20)}
                    onInc={() => incDec(setAdults, adults, 1, 1, 20)}
                />
                <GuestCounter
                    label="Çocuk (0-11 Yaş)"
                    sub={`%${100 - Math.round((childPrice / adultPrice) * 100)} indirimli`}
                    count={children}
                    onDec={() => incDec(setChildren, children, -1, 0, 10)}
                    onInc={() => incDec(setChildren, children, 1, 0, 10)}
                />
            </div>

            {/* FİYAT DÖKÜMÜ */}
            <div className="flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4">
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-secondary">
                        {adults} Yetişkin × ₺{fmt(adultPrice)}
                    </span>
                    <span className="font-semibold text-charcoal-dark">
                        ₺{fmt(adultTotal)}
                    </span>
                </div>
                {children > 0 && (
                    <div className="flex items-center justify-between font-body-sm text-body-sm">
                        <span className="text-secondary">
                            {children} Çocuk (İndirimli)
                        </span>
                        <span className="font-semibold text-charcoal-dark">
                            ₺{fmt(childTotal)}
                        </span>
                    </div>
                )}
                <div className="mt-1 flex items-center justify-between border-t border-surface-variant pt-2.5">
                    <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                        Toplam
                    </span>
                    <span className="font-headline-md text-headline-md font-extrabold text-crimson-vivid">
                        ₺{fmt(grandTotal)}
                    </span>
                </div>
            </div>

            {/* CTA'LAR */}
            <div className="flex flex-col gap-3">
                <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container py-4 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-all hover:bg-crimson-vivid hover:scale-[1.01] active:scale-[0.98]"
                >
                    <Icon name="chat" className="text-[22px]" />
                    <span>WhatsApp ile Rezervasyon</span>
                </a>
                <a
                    href="tel:08503096100"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal-dark py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-sm transition-colors hover:bg-charcoal-surface"
                >
                    <Icon name="call" className="text-[18px]" />
                    <span>0850 309 61 00</span>
                </a>
            </div>

            {/* İADE */}
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/5 p-4">
                <Icon
                    name="verified_user"
                    className="mt-0.5 shrink-0 text-[22px] text-emerald-600"
                />
                <div className="flex flex-col gap-0.5">
                    <span className="font-label-uppercase text-label-uppercase font-bold text-emerald-700">
                        %100 Koşulsuz İade
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                        Kalkış tarihinden 7 gün öncesine kadar yapılan iptallerde kesintisiz
                        iade.
                    </span>
                </div>
            </div>

            {/* AJANS */}
            <div className="border-t border-surface-variant pt-4 text-center font-body-sm text-body-sm text-secondary">
                <p className="font-medium">
                    {agency.name} • TÜRSAB {agency.tursabNo}
                </p>
                <p className="mt-0.5">{agency.supportNote}</p>
            </div>
        </div>
    );
}

function GuestCounter({ label, sub, count, onDec, onInc }) {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-canvas-offwhite p-3">
            <div>
                <span className="block font-label-md text-label-md font-bold text-charcoal-dark">
                    {label}
                </span>
                <span className="block font-body-sm text-body-sm text-secondary">
                    {sub}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onDec}
                    aria-label={`${label} azalt`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-white font-bold text-charcoal-dark shadow-sm transition-all hover:bg-crimson-vivid hover:text-white hover:shadow-md active:scale-90"
                >
                    −
                </button>
                <span className="w-6 text-center font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {count}
                </span>
                <button
                    type="button"
                    onClick={onInc}
                    aria-label={`${label} arttır`}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-white font-bold text-charcoal-dark shadow-sm transition-all hover:bg-crimson-vivid hover:text-white hover:shadow-md active:scale-90"
                >
                    +
                </button>
            </div>
        </div>
    );
}