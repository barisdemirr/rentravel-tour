"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import Link from "@/components/ui/LocalizedLink";
import PhoneField from "@/components/ui/PhoneField";
import { ApiError } from "@/lib/api";
import { SITE, waHref } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { EASE } from "@/lib/motion";
import { findCountry, fullPhone, isPhoneComplete } from "@/lib/phone";
import { infoMessage } from "@/lib/whatsapp";
import { createVipRequest } from "@/services";

const STEPS = ["fullName", "phone", "message"];

const emptyForm = () => ({
    fullName: "",
    phone: { country: "TR", digits: "" },
    message: "",
    website: "",
});

export default function VipRequestClient() {
    const { t, tpl, locale, isRtl } = useLanguage();
    const v = t.vip;

    const [step, setStep] = useState(-1); // -1: giriş ekranı
    const [direction, setDirection] = useState(1); // 1 ileri, -1 geri
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [sendError, setSendError] = useState("");
    const [done, setDone] = useState(false);
    const inputRef = useRef(null);

    /* Adım değişince alana odaklan */
    useEffect(() => {
        if (step >= 0 && step < STEPS.length) {
            const timer = setTimeout(() => inputRef.current?.focus(), 350);
            return () => clearTimeout(timer);
        }
    }, [step]);

    /* Metin alanları için ortak değiştirici */
    const set = (name) => (e) => {
        setForm((f) => ({ ...f, [name]: e.target.value }));
        if (errors[name]) setErrors((x) => ({ ...x, [name]: null }));
    };

    /* Telefon nesne döndürdüğü için ayrı */
    const setPhone = (next) => {
        setForm((f) => ({ ...f, phone: next }));
        if (errors.phone) setErrors((x) => ({ ...x, phone: null }));
    };

    /* Tuzak alan: botlar doldurur, insanlar görmez */
    const setHoneypot = (e) => setForm((f) => ({ ...f, website: e.target.value }));

    /* Tarayıcıda ön kontrol, asıl doğrulama backend'de */
    const validate = (name) => {
        if (name === "fullName") return form.fullName.trim().length >= 3 ? null : v.nameError;

        if (name === "phone") {
            const country = findCountry(form.phone.country);
            if (!form.phone.digits) return v.phoneError;
            if (!isPhoneComplete(form.phone.digits, country)) {
                return tpl(v.phoneLengthError, {
                    country: country.name,
                    digits: country.digits.join(" / "),
                });
            }
            return null;
        }

        if (name === "message") return form.message.trim().length >= 10 ? null : v.messageError;
        return null;
    };

    const goNext = () => {
        const name = STEPS[step];
        const error = validate(name);

        if (error) {
            setErrors((x) => ({ ...x, [name]: error }));
            return;
        }

        setDirection(1);
        if (step === STEPS.length - 1) submit();
        else setStep((s) => s + 1);
    };

    const goBack = () => {
        setDirection(-1);
        setStep((s) => Math.max(-1, s - 1));
    };

    const submit = async () => {
        if (busy) return;

        setBusy(true);
        setSendError("");

        try {
            await createVipRequest({
                fullName: form.fullName.trim(),
                phone: fullPhone(form.phone.digits, findCountry(form.phone.country)),
                message: form.message.trim(),
                locale,
                website: form.website,
            });
            setDone(true);
        } catch (error) {
            if (error instanceof ApiError && error.isValidationError?.()) {
                // Backend alan bazlı hata döndürdüyse ilgili adıma dön
                const fieldErrors = error.errors ?? {};
                const firstField = STEPS.find((s) => fieldErrors[s]);
                if (firstField) {
                    setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, val]) => [k, val[0]])));
                    setStep(STEPS.indexOf(firstField));
                    setBusy(false);
                    return;
                }
            }
            setSendError(error?.detail || error?.message || v.errorTitle);
        } finally {
            setBusy(false);
        }
    };

    const onKeyDown = (e) => {
        // Çok satırlı alanda Enter satır atlar, Ctrl+Enter gönderir
        if (e.key !== "Enter") return;
        const isTextarea = e.target.tagName === "TEXTAREA";
        if (isTextarea && !e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        goNext();
    };

    const reset = () => {
        setDone(false);
        setStep(-1);
        setDirection(1);
        setForm(emptyForm());
        setErrors({});
        setSendError("");
    };

    const whatsapp = waHref(infoMessage({ topic: "VIP talep", locale }));

    /* Yatay kayma animasyonu, RTL'de ters yönde */
    const slide = {
        enter: (dir) => ({ opacity: 0, x: dir * (isRtl ? -56 : 56) }),
        center: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir * (isRtl ? 56 : -56) }),
    };

    const transition = { duration: 0.42, ease: EASE };

    return (
        <div className="relative min-h-[calc(100dvh-4rem)] w-full overflow-hidden bg-charcoal-dark text-surface-white md:min-h-[calc(100dvh-5rem)]">
            {/* Arka plan ışıkları */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -start-32 -top-32 h-[420px] w-[420px] rounded-full bg-crimson-vivid/20 blur-[130px]"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -end-24 h-[380px] w-[380px] rounded-full bg-white/5 blur-[120px]"
            />

            <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-3xl flex-col px-5 py-8 sm:px-8 md:py-12">
                {/* İlerleme çubuğu */}
                {step >= 0 && !done && (
                    <div className="mb-8 flex items-center gap-3 sm:mb-10">
                        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-crimson-vivid to-[#ff4d6d]"
                                initial={false}
                                animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                                transition={{ duration: 0.4, ease: EASE }}
                            />
                        </div>
                        <span dir="ltr" className="shrink-0 font-label-md text-label-md font-semibold text-white/50">
                            {tpl(v.stepOf, { current: step + 1, total: STEPS.length })}
                        </span>
                    </div>
                )}

                {/* İçerik */}
                <div className="flex flex-1 items-center">
                    <AnimatePresence mode="wait" custom={direction} initial={false}>
                        {done ? (
                            <motion.div
                                key="done"
                                custom={direction}
                                variants={slide}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className="w-full"
                            >
                                <Success v={v} whatsapp={whatsapp} onReset={reset} />
                            </motion.div>
                        ) : step === -1 ? (
                            <motion.div
                                key="intro"
                                custom={direction}
                                variants={slide}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className="w-full"
                            >
                                <Intro
                                    v={v}
                                    onStart={() => {
                                        setDirection(1);
                                        setStep(0);
                                    }}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key={STEPS[step]}
                                custom={direction}
                                variants={slide}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={transition}
                                className="w-full"
                            >
                                <Question
                                    v={v}
                                    name={STEPS[step]}
                                    value={form[STEPS[step]]}
                                    error={errors[STEPS[step]]}
                                    onChange={STEPS[step] === "phone" ? setPhone : set(STEPS[step])}
                                    onHoneypot={setHoneypot}
                                    onKeyDown={onKeyDown}
                                    inputRef={inputRef}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Gönderim hatası */}
                {sendError && !done && (
                    <p
                        role="alert"
                        className="mb-4 flex items-start gap-2 rounded-2xl border border-crimson-vivid/30 bg-crimson-vivid/10 px-4 py-3 font-body-sm text-body-sm text-white"
                    >
                        <Icon name="error" className="mt-0.5 shrink-0 text-[18px] text-crimson-vivid" />
                        <span className="min-w-0">{sendError}</span>
                    </p>
                )}

                {/* Alt gezinme */}
                {step >= 0 && !done && (
                    <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                        <button
                            type="button"
                            onClick={goBack}
                            disabled={busy}
                            className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl px-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-40 sm:px-4"
                        >
                            <Icon name="arrow_back" className="text-[18px] rtl:-scale-x-100" />
                            {v.back}
                        </button>

                        <span className="hidden flex-1 text-center font-label-sm text-label-sm text-white/30 sm:block">
                            {v.enterHint}
                        </span>

                        <button
                            type="button"
                            onClick={goNext}
                            disabled={busy}
                            className="ms-auto flex h-12 min-w-0 shrink items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-crimson-vivid to-[#a80320] px-5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-[0_8px_24px_-8px_rgba(217,4,41,0.8)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 sm:ms-0 sm:shrink-0 sm:px-6"
                        >
                            {busy && <Icon name="progress_activity" className="shrink-0 animate-spin text-[18px]" />}
                            <span className="truncate">
                                {busy ? v.sending : step === STEPS.length - 1 ? v.submit : v.next}
                            </span>
                            {!busy && step < STEPS.length - 1 && (
                                <Icon name="arrow_forward" className="shrink-0 text-[18px] rtl:-scale-x-100" />
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Giriş ekranı ── */
function Intro({ v, onStart }) {
    return (
        <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid backdrop-blur-md">
                <Icon name="workspace_premium" fill className="shrink-0 text-[16px]" />
                {v.eyebrow}
            </span>

            <h1 className="text-pretty font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-white md:font-display-hero md:text-display-hero">
                {v.introTitle}
            </h1>

            <p className="max-w-lg font-body-md text-body-md font-light leading-relaxed text-white/60">
                {v.introText}
            </p>

            <button
                type="button"
                onClick={onStart}
                className="mt-2 flex h-14 items-center gap-2.5 rounded-2xl bg-gradient-to-br from-crimson-vivid to-[#a80320] px-8 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white shadow-[0_10px_30px_-8px_rgba(217,4,41,0.8)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
                {v.start}
                <Icon name="arrow_forward" className="text-[20px] rtl:-scale-x-100" />
            </button>

            <div className="mt-6 flex flex-col gap-2.5 border-t border-white/10 pt-6 font-label-md text-label-md text-white/45">
                {[v.trust1, v.trust2, v.trust3].map((text) => (
                    <span key={text} className="flex items-start gap-2">
                        <Icon name="check_circle" fill className="mt-0.5 shrink-0 text-[16px] text-emerald-400" />
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ── Tek soru ── */
function Question({ v, name, value, error, onChange, onHoneypot, onKeyDown, inputRef }) {
    const copy = {
        fullName: { q: v.nameQuestion, hint: v.nameHint, ph: v.namePlaceholder, icon: "person" },
        phone: { q: v.phoneQuestion, hint: v.phoneHint, ph: v.phonePlaceholder, icon: "call" },
        message: { q: v.messageQuestion, hint: v.messageHint, ph: v.messagePlaceholder, icon: "edit_note" },
    }[name];

    const fieldCls =
        "w-full border-0 border-b-2 bg-transparent px-0 pb-3 pt-2 font-headline-md text-headline-md font-semibold text-white outline-none transition-colors placeholder:font-normal placeholder:text-white/25 md:font-headline-lg md:text-headline-lg";

    const borderCls = error ? "border-crimson-vivid" : "border-white/20 focus:border-crimson-vivid";

    return (
        <div className="flex w-full flex-col gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-crimson-vivid/15 text-crimson-vivid">
                <Icon name={copy.icon} className="text-[22px]" />
            </span>

            <div>
                <h2 className="text-pretty font-headline-md text-headline-md font-extrabold leading-tight tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                    {copy.q}
                </h2>
                <p className="mt-2 font-body-sm text-body-sm text-white/50">{copy.hint}</p>
            </div>

            {/* relative: tuzak alan bu kutunun içinde kalsın */}
            <div className="relative mt-2">
                {name === "message" ? (
                    <textarea
                        ref={inputRef}
                        rows={4}
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        placeholder={copy.ph}
                        maxLength={2000}
                        className={`${fieldCls} ${borderCls} resize-none font-body-lg text-body-lg leading-relaxed md:font-headline-sm md:text-headline-sm`}
                    />
                ) : name === "phone" ? (
                    <PhoneField
                        value={value}
                        onChange={onChange}
                        error={error}
                        inputRef={inputRef}
                        onKeyDown={onKeyDown}
                        placeholder={copy.ph}
                    />
                ) : (
                    <input
                        ref={inputRef}
                        type="text"
                        autoComplete="name"
                        value={value}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        placeholder={copy.ph}
                        maxLength={120}
                        className={`${fieldCls} ${borderCls}`}
                    />
                )}

                {/* Tuzak alan: ekran okuyucudan ve gözden gizli, botlar doldurur */}
                {name === "fullName" && (
                    <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
                        onChange={onHoneypot}
                    />
                )}

                {error && (
                    <p
                        role="alert"
                        className="mt-3 flex items-start gap-1.5 font-label-md text-label-md text-crimson-vivid"
                    >
                        <Icon name="error" className="mt-0.5 shrink-0 text-[15px]" />
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ── Başarı ── */
function Success({ v, whatsapp, onReset }) {
    return (
        <div className="flex flex-col items-start gap-5">
            <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.45, ease: EASE }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400"
            >
                <Icon name="check_circle" fill className="text-[34px]" />
            </motion.span>

            <h2 className="text-pretty font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-white md:font-headline-lg md:text-headline-lg">
                {v.successTitle}
            </h2>

            <p className="max-w-lg font-body-md text-body-md font-light leading-relaxed text-white/60">
                {v.successText}
            </p>

            <div className="mt-2 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <a
                    href={whatsapp ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white transition-colors hover:bg-emerald-500"
                >
                    <Icon name="chat" className="shrink-0 text-[18px]" />
                    {v.successWhatsapp}
                </a>
                <a
                    href={SITE.phoneHref}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white transition-colors hover:bg-white/10"
                >
                    <Icon name="call" className="shrink-0 text-[18px] text-crimson-vivid" />
                    <span dir="ltr">{SITE.phone}</span>
                </a>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-5 font-label-md text-label-md">
                <Link href="/" className="text-white/50 transition-colors hover:text-white">
                    {v.successHome}
                </Link>
                <button type="button" onClick={onReset} className="text-white/50 transition-colors hover:text-white">
                    {v.newRequest}
                </button>
            </div>
        </div>
    );
}