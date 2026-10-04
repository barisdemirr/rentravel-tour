"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { waHref } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import { getCultureTourAccommodationOptions } from "@/services";
import { bungalowMessage, carMessage, cultureTourMessage, dailyTourMessage } from "@/lib/whatsapp";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";

const TABS = [
    { key: "car", icon: "directions_car" },
    { key: "daily", icon: "tour" },
    { key: "culture", icon: "castle" },
    { key: "bungalow", icon: "cottage" },
];

/** Bugünden n gün sonrasının ISO tarihi (YYYY-MM-DD) */
const dateISO = (offsetDays = 0) =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000 + offsetDays * 86400000)
        .toISOString()
        .slice(0, 10);

const fieldCls =
    "w-full rounded-xl bg-canvas-offwhite px-4 py-3 font-body-md text-body-md text-charcoal-dark outline-none transition-all focus:ring-2 focus:ring-crimson-vivid/40 disabled:cursor-not-allowed disabled:opacity-60";
const labelCls =
    "flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary";

/* Çocuk yaşları: dinamik input dizisi */
function ChildrenAgesInput({ ages, setAges, labels }) {
    const maxChildren = 5;

    const updateAge = (i, val) => setAges(ages.map((a, idx) => (idx === i ? val : a)));

    return (
        <div className="flex flex-col gap-2">
            <span className={labelCls}>
                <Icon name="child_care" className="text-[14px] text-crimson-vivid" />
                {labels.children}
            </span>
            <div className="flex flex-wrap items-center gap-2">
                {ages.map((age, i) => (
                    <div key={i} className="relative">
                        <input
                            type="number"
                            min="0"
                            max="17"
                            required
                            placeholder={labels.age}
                            aria-label={`${labels.age} ${i + 1}`}
                            value={age}
                            onChange={(e) => updateAge(i, e.target.value)}
                            className={`${fieldCls} w-20 pe-8 text-center`}
                        />
                        <button
                            type="button"
                            onClick={() => setAges(ages.filter((_, idx) => idx !== i))}
                            aria-label={labels.removeChild}
                            className="absolute end-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-crimson-vivid/10 hover:text-crimson-vivid"
                        >
                            <Icon name="close" className="text-[14px]" />
                        </button>
                    </div>
                ))}
                {ages.length < maxChildren && (
                    <button
                        type="button"
                        onClick={() => setAges([...ages, ""])}
                        className="flex h-11 items-center gap-1 rounded-xl border border-dashed border-outline-variant px-3 font-label-sm text-label-sm text-secondary transition-colors hover:border-crimson-vivid hover:text-crimson-vivid"
                    >
                        <Icon name="add" className="text-[16px]" />
                        {labels.addChild}
                    </button>
                )}
            </div>
        </div>
    );
}

export default function BookingSection({ dailyTours = [], cultureTours = [] }) {
    const { t, locale } = useLanguage();
    const b = t.booking;
    const [tab, setTab] = useState("car");
    const [today, setToday] = useState("");

    // Her sekmenin kendi state'i: sekmeler arası geçişte veriler kaybolmaz
    const [carForm, setCarForm] = useState({
        pickupDate: "",
        pickupTime: "10:00",
        returnDate: "",
        returnTime: "10:00",
    });
    const [dailyForm, setDailyForm] = useState({
        slug: dailyTours[0]?.slug ?? "",
        date: "",
        adults: 2,
        childAges: [],
    });
    const [cultureForm, setCultureForm] = useState({
        slug: cultureTours[0]?.slug ?? "",
        date: "",
        accommodationId: "",
        adults: 2,
        childAges: [],
    });
    const [bungalowForm, setBungalowForm] = useState({
        checkIn: "",
        checkOut: "",
        adults: 2,
        children: 0,
    });

    // Kültür turunun konaklama seçenekleri (tur seçilince yüklenir)
    const [options, setOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    // Tarihler istemcide ayarlanır (hydration uyumsuzluğu olmasın)
    useEffect(() => {
        const t0 = dateISO(0);
        const t1 = dateISO(1);
        setToday(t0);
        setCarForm((f) => ({ ...f, pickupDate: f.pickupDate || t0, returnDate: f.returnDate || t1 }));
        setDailyForm((f) => ({ ...f, date: f.date || t0 }));
        setCultureForm((f) => ({ ...f, date: f.date || t0 }));
        setBungalowForm((f) => ({ ...f, checkIn: f.checkIn || t0, checkOut: f.checkOut || t1 }));
    }, []);

    useEffect(() => {
        if (tab !== "culture" || !cultureForm.slug) return;

        let cancelled = false;
        setOptionsLoading(true);

        getCultureTourAccommodationOptions(cultureForm.slug)
            .then((list) => {
                if (cancelled) return;
                setOptions(list);
                setCultureForm((f) => ({ ...f, accommodationId: list[0]?.accommodationTypeId ?? "" }));
            })
            .catch(() => {
                if (cancelled) return;
                setOptions([]);
                setCultureForm((f) => ({ ...f, accommodationId: "" }));
            })
            .finally(() => {
                if (!cancelled) setOptionsLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [tab, cultureForm.slug]);

    const buildMessage = () => {
        if (tab === "car") return carMessage({ ...carForm, locale });

        if (tab === "daily") {
            const tour = dailyTours.find((x) => x.slug === dailyForm.slug);
            return dailyTourMessage({
                tourTitle: localized(tour?.title, "tr"),
                date: dailyForm.date,
                adults: dailyForm.adults,
                childAges: dailyForm.childAges,
                locale,
            });
        }

        if (tab === "culture") {
            const tour = cultureTours.find((x) => x.slug === cultureForm.slug);
            const option = options.find((o) => o.accommodationTypeId === cultureForm.accommodationId);
            return cultureTourMessage({
                tourTitle: localized(tour?.title, "tr"),
                date: cultureForm.date,
                accommodation: localized(option?.label, "tr"),
                adults: cultureForm.adults,
                childAges: cultureForm.childAges,
                locale,
            });
        }

        return bungalowMessage({
            checkIn: bungalowForm.checkIn,
            checkOut: bungalowForm.checkOut,
            adults: bungalowForm.adults,
            children: bungalowForm.children,
            locale,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const url = waHref(buildMessage());
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    const tourSelect = (id, icon, tours, value, onChange) => (
        <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor={id} className={labelCls}>
                <Icon name={icon} className="text-[14px] text-crimson-vivid" />
                {b.tour}
            </label>
            <select
                id={id}
                required
                disabled={tours.length === 0}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`${fieldCls} cursor-pointer`}
            >
                {tours.length === 0 && <option value="">{b.noTours}</option>}
                {tours.map((tour) => (
                    <option key={tour.slug} value={tour.slug}>
                        {localized(tour.title, locale)}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <section
            id="rezervasyon"
            aria-label={b.ariaLabel}
            className="relative z-30 mx-auto -mt-12 w-full max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop"
        >
            <Reveal>
                <div className="overflow-hidden rounded-3xl bg-surface-white shadow-xl">
                    {/* TABS */}
                    <div className="flex flex-wrap border-b border-border-hairline">
                        {TABS.map((tb) => {
                            const isActive = tab === tb.key;
                            return (
                                <button
                                    key={tb.key}
                                    type="button"
                                    aria-label={t.tabs[tb.key]}
                                    onClick={() => setTab(tb.key)}
                                    className={`relative flex min-w-[140px] flex-1 items-center justify-center gap-2 px-4 py-4 font-label-uppercase text-label-uppercase tracking-wider transition-colors ${isActive ? "text-crimson-vivid" : "text-secondary hover:text-charcoal-dark"
                                        }`}
                                >
                                    <Icon name={tb.icon} className="text-[18px]" />
                                    <span className="hidden sm:inline">{t.tabs[tb.key]}</span>
                                    {isActive && (
                                        <motion.span
                                            layoutId="booking-tab-indicator"
                                            className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-crimson-vivid"
                                            transition={{ duration: 0.25, ease: EASE }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* FORMLAR */}
                    <form onSubmit={submit} className="p-5 md:p-6 lg:p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={tab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-5"
                            >
                                {/* ── ARAÇ KİRALAMA ── */}
                                {tab === "car" && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-pickup-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                {b.pickupDate}
                                            </label>
                                            <input
                                                id="car-pickup-date"
                                                type="date"
                                                required
                                                min={today}
                                                value={carForm.pickupDate}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setCarForm((f) => ({
                                                        ...f,
                                                        pickupDate: v,
                                                        returnDate: f.returnDate < v ? v : f.returnDate,
                                                    }));
                                                }}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-pickup-time" className={labelCls}>
                                                <Icon name="schedule" className="text-[14px] text-crimson-vivid" />
                                                {b.pickupTime}
                                            </label>
                                            <input
                                                id="car-pickup-time"
                                                type="time"
                                                required
                                                value={carForm.pickupTime}
                                                onChange={(e) => setCarForm({ ...carForm, pickupTime: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-return-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                {b.returnDate}
                                            </label>
                                            <input
                                                id="car-return-date"
                                                type="date"
                                                required
                                                min={carForm.pickupDate || today}
                                                value={carForm.returnDate}
                                                onChange={(e) => setCarForm({ ...carForm, returnDate: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-return-time" className={labelCls}>
                                                <Icon name="schedule" className="text-[14px] text-crimson-vivid" />
                                                {b.returnTime}
                                            </label>
                                            <input
                                                id="car-return-time"
                                                type="time"
                                                required
                                                value={carForm.returnTime}
                                                onChange={(e) => setCarForm({ ...carForm, returnTime: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── GÜNÜBİRLİK TURLAR ── */}
                                {tab === "daily" && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        {tourSelect("daily-tour", "tour", dailyTours, dailyForm.slug, (slug) =>
                                            setDailyForm({ ...dailyForm, slug })
                                        )}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="daily-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                {b.date}
                                            </label>
                                            <input
                                                id="daily-date"
                                                type="date"
                                                required
                                                min={today}
                                                value={dailyForm.date}
                                                onChange={(e) => setDailyForm({ ...dailyForm, date: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="daily-adults" className={labelCls}>
                                                <Icon name="group" className="text-[14px] text-crimson-vivid" />
                                                {b.adults}
                                            </label>
                                            <input
                                                id="daily-adults"
                                                type="number"
                                                min="1"
                                                max="50"
                                                required
                                                value={dailyForm.adults}
                                                onChange={(e) => setDailyForm({ ...dailyForm, adults: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-4">
                                            <ChildrenAgesInput
                                                ages={dailyForm.childAges}
                                                setAges={(childAges) => setDailyForm({ ...dailyForm, childAges })}
                                                labels={b}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── KONAKLAMALI KÜLTÜR TURLARI ── */}
                                {tab === "culture" && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        {tourSelect("culture-tour", "castle", cultureTours, cultureForm.slug, (slug) =>
                                            setCultureForm({ ...cultureForm, slug, accommodationId: "" })
                                        )}
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="culture-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                {b.tourDate}
                                            </label>
                                            <input
                                                id="culture-date"
                                                type="date"
                                                required
                                                min={today}
                                                value={cultureForm.date}
                                                onChange={(e) => setCultureForm({ ...cultureForm, date: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="culture-accom" className={labelCls}>
                                                <Icon name="hotel" className="text-[14px] text-crimson-vivid" />
                                                {b.accommodation}
                                                {optionsLoading && (
                                                    <Icon
                                                        name="progress_activity"
                                                        className="animate-spin text-[14px] text-crimson-vivid"
                                                    />
                                                )}
                                            </label>
                                            <select
                                                id="culture-accom"
                                                required
                                                disabled={optionsLoading || options.length === 0}
                                                value={cultureForm.accommodationId}
                                                onChange={(e) =>
                                                    setCultureForm({ ...cultureForm, accommodationId: e.target.value })
                                                }
                                                className={`${fieldCls} cursor-pointer`}
                                            >
                                                {optionsLoading && <option value="">{b.loading}</option>}
                                                {!optionsLoading && options.length === 0 && (
                                                    <option value="">{b.noAccommodation}</option>
                                                )}
                                                {options.map((o) => (
                                                    <option key={o.accommodationTypeId} value={o.accommodationTypeId}>
                                                        {localized(o.label, locale)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="culture-adults" className={labelCls}>
                                                <Icon name="group" className="text-[14px] text-crimson-vivid" />
                                                {b.adults}
                                            </label>
                                            <input
                                                id="culture-adults"
                                                type="number"
                                                min="1"
                                                max="50"
                                                required
                                                value={cultureForm.adults}
                                                onChange={(e) => setCultureForm({ ...cultureForm, adults: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-3">
                                            <ChildrenAgesInput
                                                ages={cultureForm.childAges}
                                                setAges={(childAges) => setCultureForm({ ...cultureForm, childAges })}
                                                labels={b}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── BUNGALOV KONAKLAMA ── */}
                                {tab === "bungalow" && (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-checkin" className={labelCls}>
                                                <Icon name="login" className="text-[14px] text-crimson-vivid" />
                                                {b.checkIn}
                                            </label>
                                            <input
                                                id="bng-checkin"
                                                type="date"
                                                required
                                                min={today}
                                                value={bungalowForm.checkIn}
                                                onChange={(e) => {
                                                    const v = e.target.value;
                                                    setBungalowForm((f) => ({
                                                        ...f,
                                                        checkIn: v,
                                                        checkOut: f.checkOut <= v ? dateISOFrom(v, 1) : f.checkOut,
                                                    }));
                                                }}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-checkout" className={labelCls}>
                                                <Icon name="logout" className="text-[14px] text-crimson-vivid" />
                                                {b.checkOut}
                                            </label>
                                            <input
                                                id="bng-checkout"
                                                type="date"
                                                required
                                                min={bungalowForm.checkIn ? dateISOFrom(bungalowForm.checkIn, 1) : today}
                                                value={bungalowForm.checkOut}
                                                onChange={(e) => setBungalowForm({ ...bungalowForm, checkOut: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-adults" className={labelCls}>
                                                <Icon name="group" className="text-[14px] text-crimson-vivid" />
                                                {b.adults}
                                            </label>
                                            <input
                                                id="bng-adults"
                                                type="number"
                                                min="1"
                                                max="20"
                                                required
                                                value={bungalowForm.adults}
                                                onChange={(e) => setBungalowForm({ ...bungalowForm, adults: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-children" className={labelCls}>
                                                <Icon name="child_care" className="text-[14px] text-crimson-vivid" />
                                                {b.childCount}
                                            </label>
                                            <input
                                                id="bng-children"
                                                type="number"
                                                min="0"
                                                max="20"
                                                value={bungalowForm.children}
                                                onChange={(e) => setBungalowForm({ ...bungalowForm, children: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* SUBMIT */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container px-8 py-4 font-label-uppercase text-label-uppercase tracking-wider text-on-primary shadow-md transition-colors hover:bg-crimson-vivid sm:w-auto"
                                    >
                                        <Icon name="chat" className="text-[20px]" />
                                        <span>{t.submit}</span>
                                        <Icon
                                            name="arrow_forward"
                                            className="text-[18px] transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                                        />
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </form>
                </div>
            </Reveal>
        </section>
    );
}

/** "2027-07-15" + 1 gün -> "2027-07-16" */
function dateISOFrom(iso, days) {
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d + days);
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}