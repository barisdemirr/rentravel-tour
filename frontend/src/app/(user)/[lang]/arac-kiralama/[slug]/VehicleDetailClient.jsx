"use client";

import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";
import Link from "@/components/ui/LocalizedLink";
import { SITE, waHref } from "@/lib/constants";
import { plusDays, rentalDays as calcDays, todayISO } from "@/lib/dates";
import { formatPrice } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { carMessage } from "@/lib/whatsapp";
import { quoteVehicle } from "@/services";

export default function VehicleDetailClient({ vehicle, initialDates }) {
    const { t, tpl, locale } = useLanguage();
    const d = t.vehicleDetail;
    const p = d.panel;

    const name = localized(vehicle.name, locale);
    const money = (amount) => formatPrice(amount, vehicle.currency, locale);

    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState(initialDates?.pickupTime ?? "10:00");
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState(initialDates?.returnTime ?? "10:00");
    const [selected, setSelected] = useState([]); // seçilen ekstraların extraId listesi
    const [quote, setQuote] = useState({ status: "idle" });
    const [activeImage, setActiveImage] = useState(0);

    /* Tarihler client'ta kurulur (hydration güvenliği). Listeden gelen tarih geçmişse bugüne çekilir. */
    useEffect(() => {
        const today = todayISO();
        const pd = initialDates?.pickupDate && initialDates.pickupDate >= today ? initialDates.pickupDate : today;
        const rd = initialDates?.returnDate && initialDates.returnDate >= pd ? initialDates.returnDate : plusDays(pd, 3);
        setPickupDate(pd);
        setReturnDate(rd);
    }, [initialDates]);

    const days = calcDays(pickupDate, pickupTime, returnDate, returnTime);
    const periodValid = days > 0;
    const ready = pickupDate !== "" && returnDate !== "";

    /* Fiyat: backend quote (tarih veya ekstra değişince 0,4 sn bekleyip) */
    useEffect(() => {
        if (!ready) return;
        if (!periodValid) {
            setQuote({ status: "invalid" });
            return;
        }

        let cancelled = false;
        setQuote((q) => ({ status: "loading", data: q.data })); // önceki tutar kalsın, titreme olmasın

        const timer = setTimeout(async () => {
            try {
                const data = await quoteVehicle(vehicle.slug, {
                    pickupDate,
                    pickupTime,
                    returnDate,
                    returnTime,
                    extraIds: selected,
                });
                if (!cancelled) setQuote({ status: "ok", data });
            } catch {
                if (!cancelled) setQuote({ status: "error" });
            }
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [ready, periodValid, vehicle.slug, pickupDate, pickupTime, returnDate, returnTime, selected]);

    const q = quote.status === "ok" || quote.status === "loading" ? quote.data : null;
    const loading = quote.status === "loading";
    const shownDays = q?.days ?? days;
    const avgDaily = q ? q.rentalTotal / q.days : vehicle.defaultDailyPrice;

    const toggleExtra = (id) =>
        setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    /* WhatsApp: mesaj her zaman Türkçe */
    const whatsappHref = useMemo(() => {
        const extras = vehicle.extras.filter((e) => selected.includes(e.extraId)).map((e) => localized(e.title, "tr"));
        return waHref(
            carMessage({
                vehicleName: localized(vehicle.name, "tr"),
                pickupDate,
                pickupTime,
                returnDate,
                returnTime,
                days: q?.days,
                extras,
                total: q?.total,
                currency: vehicle.currency,
                locale,
            })
        );
    }, [vehicle, selected, pickupDate, pickupTime, returnDate, returnTime, q, locale]);

    const images = [vehicle.image, ...(vehicle.gallery ?? [])].filter(Boolean);
    const specs = vehicle.detailedSpecs ?? [];

    return (
        <>
            {/* Mobil alt CTA bar için boşluk */}
            <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:px-8 md:pb-16 md:pt-6">
                {/* Breadcrumb */}
                <nav
                    aria-label={d.breadcrumbLabel}
                    className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
                >
                    <Link href="/" className="transition-colors hover:text-crimson-vivid">
                        {d.home}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <Link href="/arac-kiralama" className="transition-colors hover:text-crimson-vivid">
                        {t.nav.cars}
                    </Link>
                    <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                    <span className="font-semibold text-charcoal-dark">{name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                    {/* ═══ SOL KOLON ═══ */}
                    <div className="flex flex-col gap-5 lg:col-span-8">
                        {/* ARAÇ HERO KARTI */}
                        <div className="relative overflow-hidden rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                            <div className="pointer-events-none absolute -end-20 -top-20 h-80 w-80 rounded-full bg-crimson-vivid/5 blur-3xl" />

                            <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md font-medium text-charcoal-dark">
                                    <Icon name="check_circle" fill className="text-[16px] text-emerald-600" />
                                    {d.freeCancel}
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md font-bold text-crimson-vivid">
                                    {d.fleet}
                                </span>
                            </div>

                            <div className="relative z-10 mb-4 flex flex-col gap-1">
                                <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                                    {name}
                                </h1>
                                {vehicle.guarantee && (
                                    <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-secondary">
                                        <span>{localized(vehicle.guarantee, locale)}</span>
                                        <Icon name="info" className="text-[14px]" />
                                    </p>
                                )}
                            </div>

                            {/* Araç görseli (+ galeri küçük resimleri) */}
                            <div className="relative mb-5 flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-canvas-offwhite/60 px-4 py-6">
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-surface-white/40 to-surface-white/80" />
                                <SafeImage
                                    src={mediaUrl(images[activeImage])}
                                    alt={mediaAlt(images[activeImage], locale, name)}
                                    className="relative z-10 max-h-56 w-auto object-contain transition-transform duration-500 hover:scale-105 sm:max-h-72"
                                />
                                {images.length > 1 && (
                                    <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-2">
                                        {images.map((img, i) => (
                                            <button
                                                key={img.id}
                                                type="button"
                                                onClick={() => setActiveImage(i)}
                                                aria-label={`${name} ${i + 1}`}
                                                className={`h-14 w-20 overflow-hidden rounded-xl bg-surface-white ring-2 transition-all ${i === activeImage ? "ring-crimson-vivid" : "ring-transparent opacity-70 hover:opacity-100"
                                                    }`}
                                            >
                                                <SafeImage src={mediaUrl(img, "thumb")} alt="" className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Teknik özellikler */}
                            {specs.length > 0 && (
                                <div className="relative z-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                    {specs.map((s, i) => (
                                        <div key={i} className="flex items-center gap-2.5 rounded-2xl bg-canvas-offwhite p-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-white text-crimson-vivid shadow-sm">
                                                <Icon name={s.icon} className="text-[20px]" />
                                            </span>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="truncate font-label-uppercase text-label-uppercase text-secondary">
                                                    {localized(s.label, locale)}
                                                </span>
                                                <span className="truncate font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                                    {localized(s.value, locale)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Açıklama (backend'de girildiyse, HTML sunucuda temizlenmiş) */}
                        {vehicle.description && localized(vehicle.description, locale) && (
                            <div className="rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                                <h2 className="mb-3 font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                    {d.about}
                                </h2>
                                <div
                                    className="font-body-sm text-body-sm leading-relaxed text-secondary [&_a]:text-crimson-vivid [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ps-5"
                                    dangerouslySetInnerHTML={{ __html: localized(vehicle.description, locale) }}
                                />
                            </div>
                        )}

                        {/* TESLİMAT & OFİS */}
                        {(vehicle.delivery || vehicle.office) && (
                            <div className="grid grid-cols-1 gap-4 rounded-3xl bg-surface-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
                                {vehicle.delivery && <DeliveryCard block={vehicle.delivery} tone="primary" />}
                                {vehicle.office && <DeliveryCard block={vehicle.office} tone="neutral" />}
                            </div>
                        )}

                        {/* KİRALAMA KOŞULLARI */}
                        <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                            <SectionHeader icon="policy" title={d.conditionsTitle} sub={d.conditionsSub} />
                            <p className="font-body-sm text-body-sm leading-relaxed text-secondary">{d.conditionsText}</p>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <ConditionCard
                                    icon="credit_card"
                                    label={d.deposit}
                                    value={money(vehicle.deposit)}
                                    badge={d.depositReturn}
                                />
                                {vehicle.kmLimit && (
                                    <ConditionCard
                                        icon="speed"
                                        label={d.kmLimit}
                                        value={tpl(d.kmLimitValue, { km: vehicle.kmLimit.toLocaleString("tr-TR") })}
                                        badge={vehicle.extraKmPrice ? tpl(d.extraKm, { price: money(vehicle.extraKmPrice) }) : null}
                                    />
                                )}
                            </div>
                        </div>

                        {/* SÜRÜCÜ GEREKSİNİMLERİ */}
                        {vehicle.driverRequirements.length > 0 && (
                            <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                                <SectionHeader icon="badge" title={d.driverTitle} sub={d.driverSub} />
                                <p className="font-body-sm text-body-sm leading-relaxed text-secondary">{d.driverText}</p>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {vehicle.driverRequirements.map((r, i) => (
                                        <div key={i} className="flex flex-col rounded-2xl bg-canvas-offwhite p-4">
                                            <span className="font-label-uppercase text-label-uppercase text-secondary">
                                                {localized(r.label, locale)}
                                            </span>
                                            <span className="mt-1 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                                {localized(r.value, locale)}
                                            </span>
                                            <span className={`mt-1 text-[10px] ${r.highlight ? "font-semibold text-crimson-vivid" : "text-secondary/70"}`}>
                                                {localized(r.sub, locale)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* EKSTRA HİZMETLER */}
                        {vehicle.extras.length > 0 && (
                            <div className="flex flex-col gap-5 rounded-3xl bg-surface-white p-5 shadow-sm sm:p-7">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                                            {d.extrasTitle}
                                        </h2>
                                        <p className="mt-0.5 font-body-sm text-body-sm text-secondary">{d.extrasSub}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed/40 px-3 py-1 font-label-md text-label-md font-semibold text-crimson-vivid">
                                        <Icon name="auto_fix_high" className="text-[14px]" />
                                        {d.instantPrice}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {vehicle.extras.map((item) => (
                                        <ExtraRow
                                            key={item.extraId}
                                            item={item}
                                            active={selected.includes(item.extraId)}
                                            days={shownDays}
                                            onToggle={() => toggleExtra(item.extraId)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ═══ SAĞ KOLON (masaüstü sticky) ═══ */}
                    <div className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28">
                            <div className="flex flex-col gap-6 rounded-3xl bg-surface-white p-5 shadow-[0_16px_36px_-6px_rgba(15,17,21,0.08)] sm:p-7">
                                {/* FİYAT BAŞLIĞI */}
                                <div className="flex flex-col gap-1.5 rounded-2xl bg-charcoal-dark p-5 text-white shadow-md">
                                    <span className="font-label-uppercase text-label-uppercase text-white/70">{p.dailyRate}</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                                            {money(avgDaily)}
                                        </span>
                                        <span className="font-body-sm text-body-sm text-white/60">{p.perDay}</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/75">
                                        <Icon name="verified" className="text-[14px] text-crimson-vivid" />
                                        <span>{p.included}</span>
                                    </div>
                                </div>

                                {/* TAKVİM */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-label-md text-label-md font-bold text-charcoal-dark">{p.calendar}</span>
                                        {periodValid && (
                                            <span className="rounded-full bg-primary-fixed/40 px-2.5 py-0.5 font-label-md text-label-md font-bold text-crimson-vivid">
                                                {tpl(p.daysBadge, { days: shownDays })}
                                            </span>
                                        )}
                                    </div>

                                    <DateBlock
                                        icon="calendar_today"
                                        label={p.pickup}
                                        date={pickupDate}
                                        time={pickupTime}
                                        onDateChange={(v) => {
                                            setPickupDate(v);
                                            if (v > returnDate) setReturnDate(plusDays(v, 3));
                                        }}
                                        onTimeChange={setPickupTime}
                                        dateMin={ready ? todayISO() : undefined}
                                    />
                                    <DateBlock
                                        icon="event_available"
                                        label={p.return}
                                        date={returnDate}
                                        time={returnTime}
                                        onDateChange={setReturnDate}
                                        onTimeChange={setReturnTime}
                                        dateMin={pickupDate || undefined}
                                    />

                                    {ready && !periodValid && (
                                        <p className="rounded-xl bg-crimson-vivid/10 px-3 py-2 font-label-md text-label-md text-crimson-vivid">
                                            {p.periodError}
                                        </p>
                                    )}
                                </div>

                                {/* FİYAT DÖKÜMÜ (backend hesabı) */}
                                <div className="flex flex-col gap-2.5 rounded-2xl bg-canvas-offwhite p-4" aria-busy={loading}>
                                    {quote.status === "error" && (
                                        <p className="font-body-sm text-body-sm text-crimson-vivid">{p.quoteError}</p>
                                    )}

                                    {q &&
                                        q.rentalLines.map((line, i) => (
                                            <div key={i} className="flex items-start justify-between gap-3 font-body-sm text-body-sm">
                                                <span className="text-secondary">
                                                    {tpl(p.lineFormat, { days: line.periods, price: money(line.unitPrice) })}
                                                    {line.label && (
                                                        <span className="block text-[11px] text-secondary/70">
                                                            {localized(line.label, locale)}
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="font-semibold text-charcoal-dark">{money(line.subtotal)}</span>
                                            </div>
                                        ))}

                                    <div className="flex items-center justify-between font-body-sm text-body-sm">
                                        <span className="text-secondary">{p.airport}</span>
                                        <span className="font-semibold text-emerald-600">{p.free}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-body-sm text-body-sm">
                                        <span className="text-secondary">{p.extras}</span>
                                        <span className="font-semibold text-charcoal-dark">{money(q?.extrasTotal ?? 0)}</span>
                                    </div>

                                    <div className="mt-1 flex items-center justify-between border-t border-surface-variant pt-2.5">
                                        <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{p.total}</span>
                                        <span className="flex items-center gap-2 font-headline-md text-headline-md font-extrabold text-crimson-vivid">
                                            {loading && (
                                                <Icon name="progress_activity" className="animate-spin text-[18px]" />
                                            )}
                                            {q ? money(q.total) : "—"}
                                        </span>
                                    </div>
                                </div>

                                {/* CTA'LAR */}
                                <div className="flex flex-col gap-3">
                                    <a
                                        href={whatsappHref ?? "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container py-4 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-all hover:scale-[1.01] hover:bg-crimson-vivid active:scale-[0.98]"
                                    >
                                        <Icon name="chat" className="text-[22px]" />
                                        <span>{p.whatsapp}</span>
                                    </a>
                                    <a
                                        href={SITE.phoneHref}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-charcoal-dark py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-sm transition-colors hover:bg-charcoal-surface"
                                    >
                                        <Icon name="call" className="text-[18px]" />
                                        <span>{p.phone}</span>
                                    </a>
                                </div>

                                {/* GÜVENLİK / DESTEK */}
                                <div className="flex flex-col gap-2 pt-2 font-body-sm text-body-sm text-secondary">
                                    <div className="flex items-center gap-2">
                                        <Icon name="support_agent" className="text-[18px] text-crimson-vivid" />
                                        <span>
                                            {p.support}{" "}
                                            <a href={SITE.phoneHref} dir="ltr" className="font-bold text-charcoal-dark hover:underline">
                                                {SITE.phone}
                                            </a>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Icon name="verified" className="text-[18px] text-crimson-vivid" />
                                        <span>{p.digital}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ MOBİL SABİT ALT CTA ═══ */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-variant bg-surface-white/95 px-4 py-3 shadow-[0_-8px_24px_-8px_rgba(15,17,21,0.12)] backdrop-blur-lg lg:hidden">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="font-label-uppercase text-label-uppercase text-secondary">
                            {tpl(p.totalDays, { days: shownDays || 0 })}
                        </span>
                        <span className="flex items-center gap-2 font-headline-sm text-headline-sm font-extrabold text-charcoal-dark">
                            {loading && <Icon name="progress_activity" className="animate-spin text-[16px] text-crimson-vivid" />}
                            {q ? money(q.total) : "—"}
                        </span>
                    </div>
                    <a
                        href={whatsappHref ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-primary-container px-6 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-colors active:scale-[0.98]"
                    >
                        <Icon name="chat" className="text-[18px]" />
                        <span>{p.rent}</span>
                    </a>
                </div>
            </div>
        </>
    );
}

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

function SectionHeader({ icon, title, sub }) {
    return (
        <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas-offwhite text-crimson-vivid">
                <Icon name={icon} className="text-[22px]" />
            </span>
            <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                    {title}
                </h2>
                <p className="mt-0.5 font-body-sm text-body-sm text-secondary">{sub}</p>
            </div>
        </div>
    );
}

function DeliveryCard({ block, tone = "primary" }) {
    const { locale } = useLanguage();
    const tones = {
        primary: { wrapper: "bg-crimson-vivid/10", icon: "text-crimson-vivid" },
        neutral: { wrapper: "bg-surface-variant/60", icon: "text-charcoal-dark" },
    };
    const style = tones[tone] || tones.primary;

    return (
        <div className="flex items-start gap-3 rounded-2xl bg-canvas-offwhite p-4">
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style.wrapper}`}>
                <Icon name={block.icon} className={`text-[24px] ${style.icon}`} />
            </span>
            <div className="flex min-w-0 flex-col">
                <span className="font-label-uppercase text-label-uppercase text-secondary">{localized(block.label, locale)}</span>
                <h3 className="mt-0.5 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {localized(block.title, locale)}
                </h3>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">{localized(block.description, locale)}</p>
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
                    <span className="font-label-uppercase text-label-uppercase text-secondary">{label}</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{value}</span>
                </div>
            </div>
            {badge && (
                <span className="rounded-full bg-surface-white px-2.5 py-1 font-label-uppercase text-label-uppercase text-secondary shadow-sm">
                    {badge}
                </span>
            )}
        </div>
    );
}

/* Ekstra: backend her ekstrayı kiralama başına bir kez ekler, bu yüzden adet sayacı yerine ekle/kaldır */
function ExtraRow({ item, active, days, onToggle }) {
    const { t, tpl, locale } = useLanguage();
    const d = t.vehicleDetail;
    const money = (amount) => formatPrice(amount, item.currency, locale);

    return (
        <div className="flex flex-col gap-4 rounded-2xl bg-canvas-offwhite p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-white text-crimson-vivid shadow-sm">
                    <Icon name={item.icon} className="text-[24px]" />
                </span>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                            {localized(item.title, locale)}
                        </span>
                        {item.tooltip && (
                            <span title={localized(item.tooltip, locale)} className="cursor-help text-secondary/70">
                                <Icon name="info" className="text-[14px]" />
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 font-body-sm text-body-sm text-secondary">{localized(item.description, locale)}</p>
                    <span className="mt-1 inline-block font-label-md text-label-md font-bold text-crimson-vivid">
                        {money(item.dailyPrice)}
                        <span className="ms-1 font-normal text-secondary">{d.perDay}</span>
                        {active && days > 0 && (
                            <span className="ms-2 font-normal text-secondary">
                                · {tpl(d.extraTotal, { price: money(item.dailyPrice * days) })}
                            </span>
                        )}
                    </span>
                </div>
            </div>

            <button
                type="button"
                onClick={onToggle}
                aria-pressed={active}
                className={`flex shrink-0 items-center justify-center gap-1.5 self-end rounded-full px-5 py-2.5 font-label-uppercase text-label-uppercase font-bold tracking-wider shadow-sm transition-colors sm:self-center ${active
                        ? "bg-primary-container text-on-primary hover:bg-crimson-vivid"
                        : "bg-surface-white text-charcoal-dark hover:bg-surface-variant"
                    }`}
            >
                <Icon name={active ? "check" : "add"} className="text-[16px]" />
                {active ? d.added : d.add}
            </button>
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
                    required
                    value={date}
                    min={dateMin}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl bg-surface-white px-3 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                />
                <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl bg-surface-white px-3 py-2.5 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                />
            </div>
        </div>
    );
}