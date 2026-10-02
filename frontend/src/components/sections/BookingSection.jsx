"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { waHref } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import { bookingOptions } from "@/lib/mockData";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";

/* ─────────────────────────────────────────────
   TAB TANIMLARI
   ───────────────────────────────────────────── */
const TABS = [
    { key: "car", icon: "directions_car" },
    { key: "daily", icon: "tour" },
    { key: "culture", icon: "castle" },
    { key: "bungalow", icon: "cottage" },
];

/* Bugünün ISO tarihini döner (YYYY-MM-DD) */
const todayISO = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

/* Yaşları array string'e çevir: ["5","7"] -> "5, 7 yaş" */
const formatAges = (ages) =>
    ages.filter((a) => a && a.trim() !== "").join(", ") + " yaş";

/* Ortak input stilleri — hepsi rounded */
const fieldCls =
    "w-full rounded-xl bg-canvas-offwhite px-4 py-3 font-body-md text-body-md text-charcoal-dark outline-none transition-all focus:ring-2 focus:ring-crimson-vivid/40";
const labelCls =
    "flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary";

/* Çocuk yaşları — dinamik input dizisi */
function ChildrenAgesInput({ ages, setAges, label }) {
    const maxChildren = 5;

    const addChild = () => {
        if (ages.length < maxChildren) setAges([...ages, ""]);
    };
    const removeChild = (i) => setAges(ages.filter((_, idx) => idx !== i));
    const updateAge = (i, val) => {
        const next = [...ages];
        next[i] = val;
        setAges(next);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className={labelCls}>
                <Icon name="child_care" className="text-[14px] text-crimson-vivid" />
                {label}
            </label>
            <div className="flex flex-wrap items-center gap-2">
                {ages.map((age, i) => (
                    <div key={i} className="relative">
                        <input
                            type="number"
                            min="0"
                            max="17"
                            placeholder="Yaş"
                            value={age}
                            onChange={(e) => updateAge(i, e.target.value)}
                            className={`${fieldCls} w-20 pr-8 text-center`}
                        />
                        <button
                            type="button"
                            onClick={() => removeChild(i)}
                            aria-label="Çocuğu sil"
                            className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-crimson-vivid/10 hover:text-crimson-vivid"
                        >
                            <Icon name="close" className="text-[14px]" />
                        </button>
                    </div>
                ))}
                {ages.length < maxChildren && (
                    <button
                        type="button"
                        onClick={addChild}
                        className="flex h-11 items-center gap-1 rounded-xl border border-dashed border-outline-variant px-3 font-label-sm text-label-sm text-secondary transition-colors hover:border-crimson-vivid hover:text-crimson-vivid"
                    >
                        <Icon name="add" className="text-[16px]" />
                        Çocuk Ekle
                    </button>
                )}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ANA BİLEŞEN
   ───────────────────────────────────────────── */
export default function BookingSection() {
    const { t } = useLanguage();
    const [tab, setTab] = useState("car");

    // Her tab için ayrı state — kullanıcı sekmeler arası gezinince veriler kaybolmaz
    const [carForm, setCarForm] = useState({
        pickupDate: "",
        pickupTime: "10:00",
        returnDate: "",
        returnTime: "10:00",
    });
    const [dailyForm, setDailyForm] = useState({
        tour: bookingOptions.dailyTours[0],
        date: "",
        adults: 2,
        childAges: [],
    });
    const [cultureForm, setCultureForm] = useState({
        tour: bookingOptions.cultureTours[0],
        date: "",
        accommodation: bookingOptions.accommodationTypes[0],
        adults: 2,
        childAges: [],
    });
    const [bungalowForm, setBungalowForm] = useState({
        checkIn: "",
        checkOut: "",
        adults: 2,
        children: 0,
    });

    // Tarihleri bugüne set et (hydration uyumsuzluğu için effect içinde)
    useEffect(() => {
        const today = todayISO();
        setCarForm((f) => ({ ...f, pickupDate: f.pickupDate || today, returnDate: f.returnDate || today }));
        setDailyForm((f) => ({ ...f, date: f.date || today }));
        setCultureForm((f) => ({ ...f, date: f.date || today }));
        setBungalowForm((f) => ({ ...f, checkIn: f.checkIn || today, checkOut: f.checkOut || today }));
    }, []);

    // WhatsApp mesajı — aktif tab'a göre
    const buildMessage = () => {
        if (tab === "car") {
            return `Merhaba, araç kiralama için rezervasyon yapmak istiyorum.\n\n• Alış: ${carForm.pickupDate} — ${carForm.pickupTime}\n• Teslim: ${carForm.returnDate} — ${carForm.returnTime}`;
        }
        if (tab === "daily") {
            const ages = dailyForm.childAges.length
                ? `\n• Çocuk Yaşları: ${formatAges(dailyForm.childAges)}`
                : "";
            return `Merhaba, günübirlik tur rezervasyonu yapmak istiyorum.\n\n• Tur: ${dailyForm.tour}\n• Tarih: ${dailyForm.date}\n• Yetişkin: ${dailyForm.adults}${ages}`;
        }
        if (tab === "culture") {
            const ages = cultureForm.childAges.length
                ? `\n• Çocuk Yaşları: ${formatAges(cultureForm.childAges)}`
                : "";
            return `Merhaba, konaklamalı kültür turu için rezervasyon yapmak istiyorum.\n\n• Tur: ${cultureForm.tour}\n• Tarih: ${cultureForm.date}\n• Konaklama: ${cultureForm.accommodation}\n• Yetişkin: ${cultureForm.adults}${ages}`;
        }
        // bungalow
        return `Merhaba, bungalov konaklama için rezervasyon yapmak istiyorum.\n\n• Giriş: ${bungalowForm.checkIn}\n• Çıkış: ${bungalowForm.checkOut}\n• Yetişkin: ${bungalowForm.adults}\n• Çocuk: ${bungalowForm.children}`;
    };

    const submit = (e) => {
        e.preventDefault();
        const url = waHref(buildMessage());
        if (url) window.open(url, "_blank", "noopener,noreferrer");
    };

    const tabLabel = (k) => ({
        car: t.search?.tabs?.car || "Araç Kiralama",
        daily: t.search?.tabs?.daily || "Günübirlik Turlar",
        culture: t.search?.tabs?.culture || "Konaklamalı Kültür Turları",
        bungalow: t.search?.tabs?.bungalow || "Bungalov Konaklama",
    })[k];

    return (
        <section
            id="rezervasyon"
            aria-label="Rezervasyon"
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
                                    onClick={() => setTab(tb.key)}
                                    className={`relative flex flex-1 min-w-[140px] items-center justify-center gap-2 px-4 py-4 font-label-uppercase text-label-uppercase tracking-wider transition-colors ${isActive
                                            ? "text-crimson-vivid"
                                            : "text-secondary hover:text-charcoal-dark"
                                        }`}
                                >
                                    <Icon name={tb.icon} className="text-[18px]" />
                                    <span className="hidden sm:inline">{tabLabel(tb.key)}</span>
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
                                                Alış Tarihi
                                            </label>
                                            <input
                                                id="car-pickup-date"
                                                type="date"
                                                value={carForm.pickupDate}
                                                onChange={(e) => setCarForm({ ...carForm, pickupDate: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-pickup-time" className={labelCls}>
                                                <Icon name="schedule" className="text-[14px] text-crimson-vivid" />
                                                Alış Saati
                                            </label>
                                            <input
                                                id="car-pickup-time"
                                                type="time"
                                                value={carForm.pickupTime}
                                                onChange={(e) => setCarForm({ ...carForm, pickupTime: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-return-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                Teslim Tarihi
                                            </label>
                                            <input
                                                id="car-return-date"
                                                type="date"
                                                value={carForm.returnDate}
                                                onChange={(e) => setCarForm({ ...carForm, returnDate: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="car-return-time" className={labelCls}>
                                                <Icon name="schedule" className="text-[14px] text-crimson-vivid" />
                                                Teslim Saati
                                            </label>
                                            <input
                                                id="car-return-time"
                                                type="time"
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
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label htmlFor="daily-tour" className={labelCls}>
                                                <Icon name="tour" className="text-[14px] text-crimson-vivid" />
                                                Tur
                                            </label>
                                            <select
                                                id="daily-tour"
                                                value={dailyForm.tour}
                                                onChange={(e) => setDailyForm({ ...dailyForm, tour: e.target.value })}
                                                className={`${fieldCls} cursor-pointer`}
                                            >
                                                {bookingOptions.dailyTours.map((tour) => (
                                                    <option key={tour} value={tour}>{tour}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="daily-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                Tarih
                                            </label>
                                            <input
                                                id="daily-date"
                                                type="date"
                                                value={dailyForm.date}
                                                onChange={(e) => setDailyForm({ ...dailyForm, date: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="daily-adults" className={labelCls}>
                                                <Icon name="group" className="text-[14px] text-crimson-vivid" />
                                                Yetişkin Sayısı
                                            </label>
                                            <input
                                                id="daily-adults"
                                                type="number"
                                                min="1"
                                                value={dailyForm.adults}
                                                onChange={(e) => setDailyForm({ ...dailyForm, adults: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-4">
                                            <ChildrenAgesInput
                                                ages={dailyForm.childAges}
                                                setAges={(ages) => setDailyForm({ ...dailyForm, childAges: ages })}
                                                label="Çocuklar (Yaşları)"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ── KONAKLAMALI KÜLTÜR TURLARI ── */}
                                {tab === "culture" && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label htmlFor="culture-tour" className={labelCls}>
                                                <Icon name="castle" className="text-[14px] text-crimson-vivid" />
                                                Tur
                                            </label>
                                            <select
                                                id="culture-tour"
                                                value={cultureForm.tour}
                                                onChange={(e) => setCultureForm({ ...cultureForm, tour: e.target.value })}
                                                className={`${fieldCls} cursor-pointer`}
                                            >
                                                {bookingOptions.cultureTours.map((tour) => (
                                                    <option key={tour} value={tour}>{tour}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="culture-date" className={labelCls}>
                                                <Icon name="event" className="text-[14px] text-crimson-vivid" />
                                                Tur Tarihi
                                            </label>
                                            <input
                                                id="culture-date"
                                                type="date"
                                                value={cultureForm.date}
                                                onChange={(e) => setCultureForm({ ...cultureForm, date: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="culture-accom" className={labelCls}>
                                                <Icon name="hotel" className="text-[14px] text-crimson-vivid" />
                                                Konaklama Tipi
                                            </label>
                                            <select
                                                id="culture-accom"
                                                value={cultureForm.accommodation}
                                                onChange={(e) => setCultureForm({ ...cultureForm, accommodation: e.target.value })}
                                                className={`${fieldCls} cursor-pointer`}
                                            >
                                                {bookingOptions.accommodationTypes.map((a) => (
                                                    <option key={a} value={a}>{a}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="culture-adults" className={labelCls}>
                                                <Icon name="group" className="text-[14px] text-crimson-vivid" />
                                                Yetişkin Sayısı
                                            </label>
                                            <input
                                                id="culture-adults"
                                                type="number"
                                                min="1"
                                                value={cultureForm.adults}
                                                onChange={(e) => setCultureForm({ ...cultureForm, adults: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="md:col-span-2 lg:col-span-4">
                                            <ChildrenAgesInput
                                                ages={cultureForm.childAges}
                                                setAges={(ages) => setCultureForm({ ...cultureForm, childAges: ages })}
                                                label="Çocuklar (Yaşları)"
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
                                                Giriş Tarihi
                                            </label>
                                            <input
                                                id="bng-checkin"
                                                type="date"
                                                value={bungalowForm.checkIn}
                                                onChange={(e) => setBungalowForm({ ...bungalowForm, checkIn: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-checkout" className={labelCls}>
                                                <Icon name="logout" className="text-[14px] text-crimson-vivid" />
                                                Çıkış Tarihi
                                            </label>
                                            <input
                                                id="bng-checkout"
                                                type="date"
                                                value={bungalowForm.checkOut}
                                                onChange={(e) => setBungalowForm({ ...bungalowForm, checkOut: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-adults" className={labelCls}>
                                                <Icon name="group" className="text-[14px] text-crimson-vivid" />
                                                Yetişkin Sayısı
                                            </label>
                                            <input
                                                id="bng-adults"
                                                type="number"
                                                min="1"
                                                value={bungalowForm.adults}
                                                onChange={(e) => setBungalowForm({ ...bungalowForm, adults: e.target.value })}
                                                className={fieldCls}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label htmlFor="bng-children" className={labelCls}>
                                                <Icon name="child_care" className="text-[14px] text-crimson-vivid" />
                                                Çocuk Sayısı
                                            </label>
                                            <input
                                                id="bng-children"
                                                type="number"
                                                min="0"
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
                                        <span>{t.search?.submit || "WhatsApp ile Rezervasyon"}</span>
                                        <Icon
                                            name="arrow_forward"
                                            className="text-[18px] transition-transform group-hover:translate-x-1"
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