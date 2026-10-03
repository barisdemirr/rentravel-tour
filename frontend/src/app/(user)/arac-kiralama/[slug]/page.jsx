"use client";

import { use, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import { getVehicleDetail } from "@/lib/mockData";

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

const fmt = (n) => Number(n).toLocaleString("tr-TR");

export default function AracDetayPage({ params }) {
    const resolved = typeof params?.then === "function" ? use(params) : params;
    const slug = resolved?.slug;

    const detail = useMemo(() => getVehicleDetail(slug), [slug]);

    /* Hydration uyumsuzluğu */
    const [mounted, setMounted] = useState(false);
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("10:00");
    const [extras, setExtras] = useState({});

    useEffect(() => {
        setMounted(true);
        const t = todayISO();
        setPickupDate(t);
        setReturnDate(plusDays(t, 3));
        /* extras state'i kur */
        const d = getVehicleDetail(slug);
        if (d?.extras) {
            const init = {};
            d.extras.forEach((e) => (init[e.key] = 0));
            setExtras(init);
        }
    }, [slug]);

    if (!detail) notFound();

    const { vehicle, dailyRate, specs, delivery, office, conditions, driverRequirements, extras: extraItems } = detail;

    const rentalDays = dayDiff(pickupDate, returnDate);
    const baseTotal = dailyRate * rentalDays;

    /* Extras toplamı */
    const extrasDailyTotal = Object.entries(extras).reduce((sum, [key, count]) => {
        const item = extraItems.find((e) => e.key === key);
        return sum + (item ? count * item.dailyPrice : 0);
    }, 0);
    const extrasTotal = extrasDailyTotal * rentalDays;
    const grandTotal = baseTotal + extrasTotal;

    const updateExtra = (key, delta) => {
        setExtras((prev) => {
            const next = Math.max(0, Math.min(5, (prev[key] || 0) + delta));
            return { ...prev, [key]: next };
        });
    };

    /* WhatsApp link */
    const whatsappHref = useMemo(() => {
        if (!mounted) return "https://wa.me/908503096100";
        const lines = [
            "Merhaba, araç kiralama talebim var.",
            "",
            `• Araç: ${vehicle.name}`,
            `• Alış: ${pickupDate} — ${pickupTime}`,
            `• Teslim: ${returnDate} — ${returnTime}`,
            `• Süre: ${rentalDays} gün`,
            `• Günlük: ${fmt(dailyRate)} ₺`,
            `• Toplam: ${fmt(grandTotal)} ₺`,
        ];
        return `https://wa.me/908503096100?text=${encodeURIComponent(lines.join("\n"))}`;
    }, [mounted, vehicle.name, pickupDate, pickupTime, returnDate, returnTime, rentalDays, dailyRate, grandTotal]);

    return (
        <>
            {/* Mobil alt CTA bar için boşluk */}
            <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-6">
                {/* Breadcrumb */}
                <nav
                    aria-label="Ekmek kırıntısı"
                    className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
                >
                    <Link href="/" className="transition-colors hover:text-crimson-vivid">Anasayfa</Link>
                    <Icon name="chevron_right" className="text-[14px]" />
                    <Link href="/arac-kiralama" className="transition-colors hover:text-crimson-vivid">Araç Kiralama</Link>
                    <Icon name="chevron_right" className="text-[14px]" />
                    <span className="font-semibold text-charcoal-dark">{vehicle.name}</span>
                </nav>

                {/* Grid: Sol içerik + Sağ rezervasyon */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                    {/* ═══ SOL KOLON ═══ */}
                    <div className="flex flex-col gap-5 lg:col-span-8">
                        {/* ARAÇ HERO KARTI */}
                        <div className="relative overflow-hidden rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                            <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-crimson-vivid/5 blur-3xl" />

                            {/* Üst durum şeridi */}
                            <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md font-medium text-charcoal-dark">
                                    <Icon name="check_circle" fill className="text-[16px] text-emerald-600" />
                                    Son 24 Saate Kadar Ücretsiz İptal
                                </span>
                                <div className="inline-flex items-center gap-2 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md">
                                    <span className="font-bold text-crimson-vivid">Rentravel VIP Filo</span>
                                    <span className="h-1 w-1 rounded-full bg-secondary/40" />
                                    <div className="flex items-center gap-1">
                                        <Icon name="star" fill className="text-[14px] text-amber-500" />
                                        <span className="font-bold text-charcoal-dark">{vehicle.rating}</span>
                                    </div>
                                    <span className="text-secondary">({vehicle.reviews} Değerlendirme)</span>
                                </div>
                            </div>

                            {/* Başlık */}
                            <div className="relative z-10 mb-4 flex flex-col gap-1">
                                <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                                    {vehicle.name}
                                </h1>
                                <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
                                    <span>{detail.guaranteeNote}</span>
                                    <Icon name="info" className="text-[14px]" />
                                </p>
                            </div>

                            {/* Araç görseli */}
                            <div className="relative mb-5 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-canvas-offwhite/60 px-4 py-6">
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-surface-white/40 to-surface-white/80" />
                                <SafeImage
                                    src={vehicle.image}
                                    alt={vehicle.name}
                                    className="relative z-10 max-h-56 w-auto object-contain transition-transform duration-500 hover:scale-105 sm:max-h-72"
                                />
                            </div>

                            {/* Specs Bento Grid */}
                            <div className="relative z-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {specs.map((s) => (
                                    <div
                                        key={s.label}
                                        className="flex items-center gap-2.5 rounded-2xl bg-canvas-offwhite p-3"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-white text-crimson-vivid shadow-sm">
                                            <Icon name={s.icon} className="text-[20px]" />
                                        </span>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="truncate font-label-uppercase text-label-uppercase text-secondary">
                                                {s.label}
                                            </span>
                                            <span className="truncate font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                                {s.value}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TESLİMAT & OFİS */}
                        <div className="grid grid-cols-1 gap-4 rounded-3xl bg-surface-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
                            <DeliveryCard {...delivery} tone="primary" />
                            <DeliveryCard {...office} tone="neutral" />
                        </div>

                        {/* KİRALAMA KOŞULLARI */}
                        <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-offwhite text-crimson-vivid">
                                    <Icon name="policy" className="text-[22px]" />
                                </span>
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                        Kiralama Koşulları
                                    </h2>
                                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                                        Rezervasyon sürecindeki standart prosedürler
                                    </p>
                                </div>
                            </div>

                            <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                Ofise ulaştığınızda Rentravel yetkilisi tarafından, sürücü adına düzenlenmiş kredi kartından depozito tutarı bloke edilir. Araç teslimi öncesi Findeks sorgusu anlık gerçekleştirilir; kriterleri sağlayan misafirlerimize 3 dakikada hızlı anahtar teslimi yapılır.
                            </p>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <ConditionCard
                                    icon="credit_card"
                                    label="Depozito / Provizyon"
                                    value={`${conditions.deposit},00 ₺`}
                                    badge={conditions.depositReturn}
                                />
                                <ConditionCard
                                    icon="speed"
                                    label="Kullanım KM Sınırı"
                                    value={conditions.kmLimit}
                                    badge={conditions.extraKm}
                                />
                            </div>
                        </div>

                        {/* SÜRÜCÜ GEREKSİNİMLERİ */}
                        <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-offwhite text-crimson-vivid">
                                    <Icon name="badge" className="text-[22px]" />
                                </span>
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                        Sürücü Yaşı ve Ehliyet Gereksinimleri
                                    </h2>
                                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                                        Teslim alacak ana ve ek sürücüler için zorunlu kriterler
                                    </p>
                                </div>
                            </div>

                            <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                Aracı teslim alabilmeniz için yanınızda T.C. kimliğiniz veya pasaportunuz, en az 1 yıllık fiziksel sürücü belgeniz ve üzerinizde adınızın bulunduğu şahsi kredi kartınız bulunmalıdır.
                            </p>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {driverRequirements.map((r) => (
                                    <div
                                        key={r.label}
                                        className="flex flex-col rounded-2xl bg-canvas-offwhite p-4"
                                    >
                                        <span className="font-label-uppercase text-label-uppercase text-secondary">
                                            {r.label}
                                        </span>
                                        <span className="mt-1 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                            {r.value}
                                        </span>
                                        <span className={`mt-1 text-[10px] ${r.highlight ? "font-semibold text-crimson-vivid" : "text-secondary/70"}`}>
                                            {r.sub}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* EKSTRA HİZMETLER */}
                        <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                        Ekstra Hizmetler ve Güvence Paketleri
                                    </h2>
                                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                                        Seyahatinizi daha konforlu ve güvenli hale getirin
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/40 px-3 py-1 font-label-md text-label-md font-semibold text-crimson-vivid">
                                    <Icon name="auto_fix_high" className="text-[14px]" />
                                    Fiyata Anında Yansır
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                {extraItems.map((item) => (
                                    <ExtraRow
                                        key={item.key}
                                        item={item}
                                        count={extras[item.key] || 0}
                                        onAdd={() => updateExtra(item.key, 1)}
                                        onRemove={() => updateExtra(item.key, -1)}
                                        days={rentalDays}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ═══ SAĞ KOLON (masaüstü sticky) ═══ */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <BookingPanel
                                vehicle={vehicle}
                                dailyRate={dailyRate}
                                rentalDays={rentalDays}
                                baseTotal={baseTotal}
                                extrasTotal={extrasTotal}
                                grandTotal={grandTotal}
                                pickupDate={pickupDate}
                                setPickupDate={setPickupDate}
                                pickupTime={pickupTime}
                                setPickupTime={setPickupTime}
                                returnDate={returnDate}
                                setReturnDate={setReturnDate}
                                returnTime={returnTime}
                                setReturnTime={setReturnTime}
                                whatsappHref={whatsappHref}
                                mounted={mounted}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ MOBİL SABİT ALT CTA ═══ */}
            {mounted && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-variant bg-surface-white/95 px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(15,17,21,0.12)] backdrop-blur-lg lg:hidden">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="font-label-uppercase text-label-uppercase text-secondary">
                                Toplam · {rentalDays} gün
                            </span>
                            <span className="font-headline-sm text-headline-sm font-extrabold text-charcoal-dark">
                                {fmt(grandTotal)} ₺
                            </span>
                        </div>
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-6 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-colors active:scale-[0.98]"
                        >
                            <Icon name="chat" className="text-[18px]" />
                            <span>Kirala</span>
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

function DeliveryCard({ icon, label, title, description, tone = "primary" }) {
    const tones = {
        primary: {
            wrapper: "bg-crimson-vivid/10",
            icon: "text-crimson-vivid",
        },
        neutral: {
            wrapper: "bg-surface-variant/60",
            icon: "text-charcoal-dark",
        },
    };
    const t = tones[tone] || tones.primary;

    return (
        <div className="flex items-start gap-3 rounded-2xl bg-canvas-offwhite p-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${t.wrapper}`}>
                <Icon name={icon} className={`text-[24px] ${t.icon}`} />
            </span>
            <div className="flex min-w-0 flex-col">
                <span className="font-label-uppercase text-label-uppercase text-secondary">
                    {label}
                </span>
                <h3 className="mt-0.5 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {title}
                </h3>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ConditionCard({ icon, label, value, badge }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-canvas-offwhite p-4">
            <div className="flex items-center gap-3">
                <Icon name={icon} className="text-[22px] text-crimson-vivid" />
                <div className="flex flex-col">
                    <span className="font-label-uppercase text-label-uppercase text-secondary">
                        {label}
                    </span>
                    <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                        {value}
                    </span>
                </div>
            </div>
            <span className="rounded-full bg-surface-white px-2.5 py-1 font-label-uppercase text-label-uppercase text-secondary shadow-sm">
                {badge}
            </span>
        </div>
    );
}

function ExtraRow({ item, count, onAdd, onRemove, days }) {
    const total = count * item.dailyPrice * days;

    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-canvas-offwhite p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-white text-crimson-vivid shadow-sm">
                    <Icon name={item.icon} className="text-[24px]" />
                </span>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                            {item.title}
                        </span>
                        {item.tooltip && (
                            <span
                                title={item.tooltip}
                                className="cursor-help text-secondary/70"
                            >
                                <Icon name="info" className="text-[14px]" />
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">
                        {item.description}
                    </p>
                    <span className="mt-1 inline-block font-label-md text-label-md font-bold text-crimson-vivid">
                        {fmt(item.dailyPrice)},00 ₺
                        <span className="ml-1 font-normal text-secondary">/ gün</span>
                        {count > 0 && (
                            <span className="ml-2 font-normal text-secondary">
                                · Toplam {fmt(total)} ₺
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end rounded-full bg-surface-white p-1 shadow-sm sm:self-center">
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={count === 0}
                    aria-label={`${item.title} azalt`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas-offwhite font-bold text-charcoal-dark transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
                >
                    −
                </button>
                <span className="w-6 text-center font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {count}
                </span>
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={count >= 5}
                    aria-label={`${item.title} arttır`}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas-offwhite font-bold text-charcoal-dark transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-40"
                >
                    +
                </button>
            </div>
        </div>
    );
}

/* Rezervasyon paneli */
function BookingPanel({
    vehicle,
    dailyRate,
    rentalDays,
    baseTotal,
    extrasTotal,
    grandTotal,
    pickupDate,
    setPickupDate,
    pickupTime,
    setPickupTime,
    returnDate,
    setReturnDate,
    returnTime,
    setReturnTime,
    whatsappHref,
    mounted,
}) {
    return (
        <div className="flex flex-col gap-6 rounded-3xl bg-surface-white p-5 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.08)] sm:p-7">
            {/* FİYAT BAŞLIĞI — koyu gri */}
            <div className="flex flex-col gap-1.5 rounded-2xl bg-charcoal-dark p-5 text-white shadow-md">
                <span className="font-label-uppercase text-label-uppercase text-white/70">
                    Günlük Kiralama Bedeli
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                        {fmt(dailyRate)} ₺
                    </span>
                    <span className="font-body-sm text-body-sm text-white/60">/ gün</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/75">
                    <Icon name="verified" className="text-[14px] text-crimson-vivid" />
                    <span>KDV, Tam Kasko ve Havalimanı Teslimatı Dahil</span>
                </div>
            </div>

            {/* TAKVİM */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md font-bold text-charcoal-dark">
                        Kiralama Takvimi
                    </span>
                    <span className="rounded-full bg-primary-fixed/40 px-2.5 py-0.5 font-label-md text-label-md font-bold text-crimson-vivid">
                        {rentalDays} Gün
                    </span>
                </div>

                <DateBlock
                    icon="calendar_today"
                    label="Alış Tarihi & Saati"
                    date={pickupDate}
                    time={pickupTime}
                    onDateChange={(v) => {
                        setPickupDate(v);
                        if (v > returnDate) setReturnDate(plusDays(v, 3));
                    }}
                    onTimeChange={setPickupTime}
                    dateMin={mounted ? todayISO() : undefined}
                />

                <DateBlock
                    icon="event_available"
                    label="İade Tarihi & Saati"
                    date={returnDate}
                    time={returnTime}
                    onDateChange={setReturnDate}
                    onTimeChange={setReturnTime}
                    dateMin={pickupDate || undefined}
                />
            </div>

            {/* FİYAT DÖKÜMÜ */}
            <div className="flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4">
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-secondary">
                        {rentalDays} Gün × {fmt(dailyRate)} ₺
                    </span>
                    <span className="font-semibold text-charcoal-dark">
                        {fmt(baseTotal)},00 ₺
                    </span>
                </div>
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-secondary">Havalimanı Karşılama</span>
                    <span className="font-semibold text-emerald-600">ÜCRETSİZ</span>
                </div>
                <div className="flex items-center justify-between font-body-sm text-body-sm">
                    <span className="text-secondary">Ekstra Hizmetler</span>
                    <span className="font-semibold text-charcoal-dark">
                        {extrasTotal > 0 ? `${fmt(extrasTotal)},00 ₺` : "0,00 ₺"}
                    </span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-surface-variant pt-2.5">
                    <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                        Toplam Tutar
                    </span>
                    <span className="font-headline-md text-headline-md font-extrabold text-crimson-vivid">
                        {fmt(grandTotal)},00 ₺
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
                    <span>WhatsApp ile Hemen Kirala</span>
                </a>
                <a
                    href="tel:08503096100"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal-dark py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-sm transition-colors hover:bg-charcoal-surface"
                >
                    <Icon name="call" className="text-[18px]" />
                    <span>Telefonla Talep</span>
                </a>
            </div>

            {/* GÜVENLİK / DESTEK */}
            <div className="flex flex-col gap-2 pt-2 font-body-sm text-body-sm text-secondary">
                <div className="flex items-center gap-2">
                    <Icon name="support_agent" className="text-[18px] text-crimson-vivid" />
                    <span>
                        7/24 Destek:{" "}
                        <a href="tel:08503096100" className="font-bold text-charcoal-dark hover:underline">
                            0850 309 61 00
                        </a>
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Icon name="verified" className="text-[18px] text-crimson-vivid" />
                    <span>TÜRSAB Onaylı Dijital Sözleşme</span>
                </div>
            </div>
        </div>
    );
}

function DateBlock({ icon, label, date, time, onDateChange, onTimeChange, dateMin }) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl bg-canvas-offwhite p-3.5">
            <div className="flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary">
                <Icon name={icon} className="text-[14px] text-crimson-vivid" />
                <span>{label}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={date}
                    min={dateMin}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl bg-surface-white px-3 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl bg-surface-white px-3 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                />
            </div>
        </div>
    );
}