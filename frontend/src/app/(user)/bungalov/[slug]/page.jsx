"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import Lightbox from "@/components/ui/Lightbox";
import { bungalows, getBungalowDetail } from "@/lib/mockData";

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

const dayDiff = (from, to) => {
    if (!from || !to) return 0;
    const a = new Date(`${from}T00:00:00`).getTime();
    const b = new Date(`${to}T00:00:00`).getTime();
    return Math.max(1, Math.round((b - a) / 86400000));
};

const priceNum = (b) =>
    parseInt(String(b.pricePerNight).replace(/\D/g, ""), 10) || 0;

const fmtTL = (n) => `${Number(n).toLocaleString("tr-TR")} ₺`;

/* ───────── Sayfa ───────── */
export default function BungalovDetayPage({ params }) {
    const resolved = typeof params?.then === "function" ? use(params) : params;
    const slug = resolved?.slug;

    const bungalow = useMemo(
        () => bungalows.find((b) => b.slug === slug),
        [slug]
    );
    const detail = useMemo(() => getBungalowDetail(slug), [slug]);

    /* Lightbox state */
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const [mounted, setMounted] = useState(false);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(4);
    const [copied, setCopied] = useState(false);
    const [reservationSent, setReservationSent] = useState(false);

    useEffect(() => {
        setMounted(true);
        const t = todayISO();
        setCheckIn(t);
        setCheckOut(plusDays(t, 2));
    }, []);

    if (!bungalow || !detail) {
        notFound();
    }

    const nights = dayDiff(checkIn, checkOut);
    const nightlyRate = priceNum(bungalow);
    const subtotal = nightlyRate * nights;

    /* Lightbox images — string array → {src} objesi */
    const lightboxImages = useMemo(
        () => (detail?.gallery || []).map((src) => ({ src })),
        [detail]
    );

    const openLightbox = (i) => {
        setLightboxIndex(i);
        setLightboxOpen(true);
    };

    /* WhatsApp mesajı */
    const buildWhatsappHref = () => {
        const msg = [
            "Merhaba, konaklama rezervasyonu yapmak istiyorum.",
            "",
            `• Tesis: ${bungalow.title}`,
            `• Bölge: ${bungalow.location}`,
            `• Giriş: ${checkIn}`,
            `• Çıkış: ${checkOut}`,
            `• Süre: ${nights} gece`,
            `• Misafir: ${guests} kişi`,
        ].join("\n");
        return `https://wa.me/908503096100?text=${encodeURIComponent(msg)}`;
    };

    const handleShare = async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const title = `${bungalow.title} — Rentravel Turizm`;
        if (navigator.share) {
            try {
                await navigator.share({ title, url });
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

    const handleReservation = () => {
        setReservationSent(true);
        setTimeout(() => setReservationSent(false), 5000);
    };

    return (
        <>
            <div className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
                {/* ─────── BREADCRUMB ─────── */}
                <nav
                    aria-label="Ekmek kırıntısı"
                    className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
                >
                    <Link href="/" className="transition-colors hover:text-crimson-vivid">
                        Anasayfa
                    </Link>
                    <Icon name="chevron_right" className="text-[14px]" />
                    <Link
                        href="/bungalov-konaklama"
                        className="transition-colors hover:text-crimson-vivid"
                    >
                        Bungalov
                    </Link>
                    <Icon name="chevron_right" className="text-[14px]" />
                    <span className="font-semibold text-charcoal-dark">
                        {bungalow.title}
                    </span>
                </nav>

                {/* ─────── PROPERTY HEADER ─────── */}
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-3 py-0.5 font-label-md text-label-md font-semibold text-on-primary-fixed-variant">
                                <Icon name="verified" className="text-[14px]" />
                                TÜRSAB 15869
                            </span>
                            <span className="rounded-full bg-canvas-offwhite px-3 py-0.5 font-label-md text-label-md text-secondary">
                                {detail.ratingLabel}
                            </span>
                        </div>

                        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {bungalow.title}
                        </h1>

                        <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                            <Icon name="location_on" className="text-[18px] text-crimson-vivid" />
                            <span>{bungalow.location}</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-white px-4 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark shadow-sm transition-colors hover:bg-canvas-offwhite"
                        >
                            <Icon name="share" className="text-[18px]" />
                            <span>{copied ? "Kopyalandı!" : "Paylaş"}</span>
                        </button>

                        <div className="flex items-center gap-3 rounded-2xl bg-charcoal-dark px-4 py-2.5 text-white shadow-md">
                            <div className="flex flex-col leading-tight">
                                <span className="font-label-md text-label-md font-bold">
                                    {detail.ratingLabel}
                                </span>
                                <span className="font-body-sm text-body-sm opacity-80">
                                    {detail.ratingCount} Değerlendirme
                                </span>
                            </div>
                            <span className="rounded-xl bg-white px-2.5 py-1 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                {detail.ratingScore.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ─────── GALERİ ─────── */}
                <Gallery
                    images={detail.gallery}
                    label={detail.galleryLabel}
                    totalPhotos={detail.totalPhotos}
                    title={bungalow.title}
                    onImageClick={openLightbox}
                />

                {/* ─────── STICKY ANCHOR PILLS ─────── */}
                <AnchorPills />

                {/* ─────── 2 KOLON ─────── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                    <div className="flex flex-col gap-6 lg:col-span-8">
                        <FeatureStrip features={detail.featureStrip} />
                        <NarrativeBlock
                            title="Özel Dağ Sığınağınız"
                            paragraphs={detail.description}
                        />
                        <BreakfastCard breakfast={detail.breakfast} />
                        <AmenitiesBlock amenities={detail.amenities} />
                        <LocationBlock
                            distances={detail.distances}
                            note={detail.locationNote}
                        />
                        <RulesBlock rules={detail.rules} />
                    </div>

                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <BookingWidget
                                bungalow={bungalow}
                                checkIn={checkIn}
                                setCheckIn={setCheckIn}
                                checkOut={checkOut}
                                setCheckOut={setCheckOut}
                                guests={guests}
                                setGuests={setGuests}
                                nights={nights}
                                nightlyRate={nightlyRate}
                                subtotal={subtotal}
                                whatsappHref={buildWhatsappHref()}
                                onReservation={handleReservation}
                                reservationSent={reservationSent}
                                mounted={mounted}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* LIGHTBOX */}
            <Lightbox
                images={lightboxImages}
                index={lightboxIndex}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                onIndexChange={setLightboxIndex}
            />
        </>
    );
}

/* ─────────────────────────────────────────────
   GALERİ
   ───────────────────────────────────────────── */

function Gallery({ images, label, totalPhotos, title, onImageClick }) {
    const [hero, ...rest] = images;

    return (
        <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-12">
            {/* Sol büyük */}
            <button
                type="button"
                onClick={() => onImageClick?.(0)}
                className="group relative h-[260px] cursor-zoom-in overflow-hidden rounded-3xl bg-canvas-offwhite md:col-span-7 md:h-[440px] lg:h-[480px]"
            >
                <SafeImage
                    src={hero}
                    alt={`${title} — Ana görsel`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-charcoal-dark/75 px-3 py-1.5 font-label-md text-label-md text-white backdrop-blur-md transition-transform group-hover:scale-105 md:bottom-4 md:left-4">
                    <Icon name="photo_camera" className="text-[16px] text-crimson-vivid" />
                    <span>{label}</span>
                </div>
            </button>

            {/* Sağ 2x2 grid */}
            <div className="grid h-[260px] grid-cols-2 gap-3 md:col-span-5 md:h-[440px] lg:h-[480px]">
                {rest.slice(0, 4).map((img, i) => {
                    const isLast = i === 3;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onImageClick?.(i + 1)}
                            className="group relative cursor-zoom-in overflow-hidden rounded-2xl bg-canvas-offwhite"
                        >
                            <SafeImage
                                src={img}
                                alt={`${title} — Görsel ${i + 2}`}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {isLast && (
                                <div className="absolute inset-0 flex items-center justify-center bg-charcoal-dark/45 backdrop-blur-[2px] transition-colors group-hover:bg-charcoal-dark/55">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-white px-4 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark shadow-md transition-transform group-hover:scale-110">
                                        <Icon name="photo_library" className="text-[16px]" />
                                        <span>Tüm Fotoğraflar ({totalPhotos})</span>
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   STICKY ANCHOR PILLS
   ───────────────────────────────────────────── */

function AnchorPills() {
    const [active, setActive] = useState("genel-bilgiler");

    useEffect(() => {
        const sections = [
            "genel-bilgiler",
            "konaklama",
            "kahvalti",
            "olanaklar",
            "harita",
            "kurallar",
        ];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
        );

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const pills = [
        { id: "genel-bilgiler", label: "Genel Bilgiler" },
        { id: "konaklama", label: "Konaklama Detayı" },
        { id: "kahvalti", label: "Köy Kahvaltısı" },
        { id: "olanaklar", label: "Olanaklar" },
        { id: "harita", label: "Konum & Ulaşım" },
        { id: "kurallar", label: "Rezervasyon Kuralları" },
    ];

    return (
        <div className="sticky top-20 z-30 mb-6 bg-surface/90 py-1.5 backdrop-blur-md">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto rounded-full bg-canvas-offwhite p-1.5 shadow-sm">
                {pills.map((p) => {
                    const isActive = active === p.id;
                    return (
                        <a
                            key={p.id}
                            href={`#${p.id}`}
                            className={`whitespace-nowrap rounded-full px-4 py-1.5 font-label-md text-label-md transition-all ${isActive
                                    ? "bg-charcoal-dark text-white shadow-sm"
                                    : "text-secondary hover:bg-surface-variant hover:text-charcoal-dark"
                                }`}
                        >
                            {p.label}
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   FEATURE STRIP
   ───────────────────────────────────────────── */

function FeatureStrip({ features }) {
    return (
        <div
            id="genel-bilgiler"
            className="grid scroll-mt-24 grid-cols-3 gap-2 rounded-3xl bg-surface-white p-4 shadow-sm sm:grid-cols-3 md:grid-cols-6 md:gap-3 md:p-5"
        >
            {features.map((f) => (
                <div
                    key={f.label}
                    className="group flex flex-col items-center rounded-2xl p-2 text-center transition-colors hover:bg-canvas-offwhite"
                >
                    <Icon
                        name={f.icon}
                        className="mb-1 text-[26px] text-crimson-vivid transition-transform group-hover:scale-110"
                    />
                    <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                        {f.label}
                    </span>
                    <span className="font-body-sm text-body-sm text-secondary">
                        {f.sub}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────
   NARRATIVE
   ───────────────────────────────────────────── */

function NarrativeBlock({ title, paragraphs }) {
    return (
        <div
            id="konaklama"
            className="scroll-mt-24 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8"
        >
            <div className="mb-3 flex items-center gap-2">
                <span className="h-6 w-2 rounded-full bg-crimson-vivid" />
                <h2 className="font-headline-md text-headline-md font-bold text-charcoal-dark">
                    {title}
                </h2>
            </div>
            <div className="flex flex-col gap-3">
                {paragraphs.map((p, i) => (
                    <p
                        key={i}
                        className="font-body-md text-body-md leading-relaxed text-secondary"
                    >
                        {p}
                    </p>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   BREAKFAST
   ───────────────────────────────────────────── */

function BreakfastCard({ breakfast }) {
    return (
        <div
            id="kahvalti"
            className="flex scroll-mt-24 flex-col items-center gap-6 overflow-hidden rounded-3xl bg-canvas-offwhite p-6 shadow-sm sm:flex-row md:p-8"
        >
            <div className="group/bf h-48 w-full shrink-0 overflow-hidden rounded-2xl bg-canvas-offwhite sm:w-1/3">
                <SafeImage
                    src={breakfast.image}
                    alt={breakfast.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/bf:scale-105"
                />
            </div>
            <div className="flex w-full flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid">
                    <Icon name="restaurant" className="text-[16px]" />
                    Konaklamaya Dahil İkram
                </span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                    {breakfast.title}
                </h3>
                <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                    {breakfast.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                    {breakfast.tags.map((t) => (
                        <span
                            key={t}
                            className="rounded-full bg-surface-white px-3 py-1 font-label-md text-label-md text-charcoal-dark transition-transform hover:-translate-y-0.5"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   AMENITIES
   ───────────────────────────────────────────── */

function AmenitiesBlock({ amenities }) {
    return (
        <div
            id="olanaklar"
            className="scroll-mt-24 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8"
        >
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="h-6 w-2 rounded-full bg-crimson-vivid" />
                    <h2 className="font-headline-md text-headline-md font-bold text-charcoal-dark">
                        Sunulan Olanaklar
                    </h2>
                </div>
                <span className="font-label-md text-label-md font-semibold text-crimson-vivid">
                    {amenities.length} Ayrıcalık
                </span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {amenities.map((a) => (
                    <div
                        key={a.title}
                        className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-canvas-offwhite"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-offwhite text-crimson-vivid transition-colors group-hover:bg-crimson-vivid group-hover:text-white">
                            <Icon name={a.icon} className="text-[22px]" />
                        </div>
                        <div className="flex min-w-0 flex-col">
                            <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                                {a.title}
                            </span>
                            <span className="truncate font-body-sm text-body-sm text-secondary">
                                {a.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   LOCATION
   ───────────────────────────────────────────── */

function LocationBlock({ distances, note }) {
    return (
        <div
            id="harita"
            className="scroll-mt-24 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8"
        >
            <div className="mb-4 flex items-center gap-2">
                <span className="h-6 w-2 rounded-full bg-crimson-vivid" />
                <h2 className="font-headline-md text-headline-md font-bold text-charcoal-dark">
                    Konum & Civar Mesafeleri
                </h2>
            </div>

            <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-2xl bg-canvas-offwhite md:h-56">
                <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-surface-white/95 px-3 py-1.5 font-label-md text-label-md shadow-sm backdrop-blur-md">
                    <Icon name="near_me" className="text-[16px] text-crimson-vivid" />
                    <span className="text-charcoal-dark">{note}</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-secondary">
                    <Icon name="map" className="text-[36px] text-crimson-vivid/60" />
                    <span className="font-label-md text-label-md">Harita yakında</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {distances.map((d) => (
                    <div
                        key={d.place}
                        className="flex flex-col items-center rounded-2xl bg-canvas-offwhite p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:bg-crimson-vivid/5 hover:shadow-sm"
                    >
                        <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                            {d.place}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary">
                            {d.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   RULES
   ───────────────────────────────────────────── */

function RulesBlock({ rules }) {
    return (
        <div
            id="kurallar"
            className="scroll-mt-24 rounded-3xl bg-surface-white p-6 shadow-sm md:p-8"
        >
            <div className="mb-4 flex items-center gap-2">
                <span className="h-6 w-2 rounded-full bg-crimson-vivid" />
                <h2 className="font-headline-md text-headline-md font-bold text-charcoal-dark">
                    Giriş & İptal Politikası
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {rules.map((r) => (
                    <div key={r.title} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 font-label-md text-label-md font-bold text-charcoal-dark">
                            <Icon name={r.icon} className="text-[18px] text-crimson-vivid" />
                            {r.title}
                        </div>
                        <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                            {r.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   BOOKING WIDGET
   ───────────────────────────────────────────── */

function BookingWidget({
    bungalow,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    nights,
    nightlyRate,
    subtotal,
    whatsappHref,
    onReservation,
    reservationSent,
    mounted,
}) {
    return (
        <div className="rounded-3xl border border-surface-variant/60 bg-surface-white p-5 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.08)] md:p-6">
            {/* FİYAT */}
            <div className="mb-5 flex items-center justify-between rounded-2xl bg-charcoal-dark px-5 py-4 text-white shadow-md">
                <div className="flex items-baseline gap-1.5">
                    <span className="font-headline-md text-headline-md font-extrabold text-white md:font-price-lg md:text-price-lg">
                        {bungalow.pricePerNight}
                    </span>
                    <span className="font-body-sm text-body-sm text-white/70">
                        / gece
                    </span>
                </div>
                {bungalow.breakfastIncluded && (
                    <span className="rounded-full bg-white/15 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-white">
                        Kahvaltı Dahil
                    </span>
                )}
            </div>

            {/* TARİH + KİŞİ */}
            <div className="mb-5 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1 rounded-xl bg-canvas-offwhite p-3">
                        <label
                            htmlFor="checkin"
                            className="font-label-uppercase text-label-uppercase text-secondary"
                        >
                            Giriş
                        </label>
                        <input
                            id="checkin"
                            type="date"
                            value={checkIn}
                            min={mounted ? todayISO() : undefined}
                            onChange={(e) => {
                                setCheckIn(e.target.value);
                                if (e.target.value > checkOut)
                                    setCheckOut(plusDays(e.target.value, 2));
                            }}
                            className="w-full bg-transparent font-label-md text-label-md font-bold text-charcoal-dark focus:outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1 rounded-xl bg-canvas-offwhite p-3">
                        <label
                            htmlFor="checkout"
                            className="font-label-uppercase text-label-uppercase text-secondary"
                        >
                            Çıkış
                        </label>
                        <input
                            id="checkout"
                            type="date"
                            value={checkOut}
                            min={checkIn || undefined}
                            onChange={(e) => setCheckOut(e.target.value)}
                            className="w-full bg-transparent font-label-md text-label-md font-bold text-charcoal-dark focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1 rounded-xl bg-canvas-offwhite p-3">
                    <label
                        htmlFor="guests"
                        className="font-label-uppercase text-label-uppercase text-secondary"
                    >
                        Misafir Sayısı
                    </label>
                    <select
                        id="guests"
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full cursor-pointer bg-transparent font-label-md text-label-md font-bold text-charcoal-dark focus:outline-none"
                    >
                        <option value={2}>2 Misafir</option>
                        <option value={3}>3 Misafir (Ek Yatak)</option>
                        <option value={4}>4 Misafir (Aile / Grup)</option>
                        <option value={5}>5 Misafir (Ek Yatak)</option>
                        <option value={6}>6 Misafir</option>
                    </select>
                </div>
            </div>

            {/* FİYAT DÖKÜMÜ */}
            <div className="mb-5 flex flex-col gap-2 border-t border-surface-variant pt-4 font-body-sm text-body-sm">
                <div className="flex justify-between text-secondary">
                    <span>
                        {mounted ? fmtTL(nightlyRate) : bungalow.pricePerNight} × {nights} gece
                    </span>
                    <span className="font-bold text-charcoal-dark">
                        {mounted ? fmtTL(subtotal) : "—"}
                    </span>
                </div>
                {bungalow.breakfastIncluded && (
                    <div className="flex justify-between text-secondary">
                        <span>Kahvaltı ({nights} gün)</span>
                        <span className="font-bold text-emerald-600">Ücretsiz</span>
                    </div>
                )}
                <div className="flex justify-between text-secondary">
                    <span>Temizlik & Hizmet</span>
                    <span className="font-bold text-charcoal-dark">0 ₺</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-surface-variant pt-3 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    <span>Toplam</span>
                    <span className="text-crimson-vivid">
                        {mounted ? fmtTL(subtotal) : "—"}
                    </span>
                </div>
            </div>

            {/* CTA'LAR */}
            <div className="flex flex-col gap-3">
                <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-all hover:bg-crimson-vivid hover:scale-[1.01] active:scale-[0.98]"
                >
                    <Icon name="chat" className="text-[20px]" />
                    <span>WhatsApp ile Rezervasyon</span>
                </a>
                <button
                    type="button"
                    onClick={onReservation}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal-dark py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-md transition-colors hover:bg-charcoal-surface active:scale-[0.98]"
                >
                    <Icon name="calendar_month" className="text-[20px]" />
                    <span>Rezervasyon Talep Et</span>
                </button>
            </div>

            {reservationSent && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-body-sm text-body-sm font-medium text-emerald-800">
                    Talebiniz alındı! En kısa sürede size dönüş yapılacaktır.
                </div>
            )}

            {/* GARANTİLER */}
            <div className="mt-5 flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4">
                <div className="flex items-center gap-2 font-label-md text-label-md font-semibold text-charcoal-dark">
                    <Icon name="verified" className="text-[18px] text-crimson-vivid" />
                    <span>TÜRSAB Onaylı Rezervasyon</span>
                </div>
                <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                    <Icon name="support_agent" className="text-[18px] text-crimson-vivid" />
                    <span>7/24 VIP Karşılama ve Destek</span>
                </div>
                <div className="pt-1 text-center">
                    <a
                        href="tel:08503096100"
                        className="font-headline-sm text-headline-sm font-bold text-crimson-vivid transition-colors hover:text-primary-container hover:underline"
                    >
                        0850 309 61 00
                    </a>
                </div>
            </div>
        </div>
    );
}