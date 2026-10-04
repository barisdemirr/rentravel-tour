"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { SITE, SLIDE_DURATION, waHref } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HERO_SLIDES } from "@/lib/heroSlides";
import { containerVariants, itemVariants } from "@/lib/motion";
import { TONES } from "@/lib/tones";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function HeroSection() {
    const { t, tpl, isRtl } = useLanguage();
    const reduce = useReducedMotion();
    const sectionRef = useRef(null);
    const barRef = useRef(null);
    const [index, setIndex] = useState(0);
    const [tabHidden, setTabHidden] = useState(false);
    const inView = useInView(sectionRef, { amount: 0.2 });
    const paused = tabHidden || !inView;

    // Metinler sözlükten, görsel ve davranış HERO_SLIDES'tan (aynı sıra)
    const slides = useMemo(
        () => HERO_SLIDES.map((s, i) => ({ ...s, ...t.hero.slides[i] })).filter((s) => s.line1),
        [t]
    );
    const slide = slides[index];

    const go = useCallback(
        (dir) => setIndex((i) => (i + dir + slides.length) % slides.length),
        [slides.length]
    );

    useEffect(() => {
        const on = () => setTabHidden(document.hidden);
        document.addEventListener("visibilitychange", on);
        return () => document.removeEventListener("visibilitychange", on);
    }, []);

    useEffect(() => {
        slides.forEach((s) => {
            const i = new window.Image();
            i.src = s.image;
        });
    }, [slides]);

    useEffect(() => {
        const bar = barRef.current;
        if (bar) bar.style.transform = "scaleX(0)";
        if (paused || slides.length === 0) return;
        const start = performance.now();
        let raf;
        const tick = (now) => {
            const p = Math.min((now - start) / SLIDE_DURATION, 1);
            if (bar) bar.style.transform = `scaleX(${p})`;
            if (p < 1) raf = requestAnimationFrame(tick);
            else setIndex((i) => (i + 1) % slides.length);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [index, paused, slides.length]);

    if (!slide) return null;

    const isWA = slide.altKind === "whatsapp";
    const wa = isWA ? waHref() : null;
    const altHref = wa || SITE.phoneHref;
    const altLabel = isWA && !wa ? slide.altFallback : slide.alt;

    const text = tpl(slide.text, { tursabNo: SITE.tursabNo });

    return (
        <motion.section
            ref={sectionRef}
            id="hero"
            aria-roledescription="carousel"
            onPanEnd={(_, info) => {
                if (info.offset.x < -60) go(1);
                else if (info.offset.x > 60) go(-1);
            }}
            className="relative h-[calc(100svh-5rem)] max-h-[1080px] min-h-[640px] w-full touch-pan-y select-none overflow-hidden bg-charcoal-dark"
        >
            {/* Timebar */}
            <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-white/25" aria-hidden="true">
                <div
                    ref={barRef}
                    className="h-full origin-left rounded-full bg-white will-change-transform rtl:origin-right"
                    style={{ transform: "scaleX(0)" }}
                />
            </div>

            <AnimatePresence mode="sync">
                <motion.div
                    key={slide.id}
                    className="absolute inset-0 z-10 flex flex-col justify-end"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: reduce ? 1 : 1.12 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 4.5, ease: "easeOut" }}
                    >
                        <SafeImage
                            src={slide.image}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-cover"
                        />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-dark via-charcoal-dark/50 to-charcoal-dark/20" />

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="relative z-20 mx-auto w-full max-w-[1440px] px-margin pb-28 md:px-margin-tablet md:pb-32 lg:px-margin-desktop"
                    >
                        <div className="flex max-w-3xl flex-col gap-3 text-surface-white">
                            <motion.div
                                variants={itemVariants}
                                className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-1.5 font-label-uppercase text-label-uppercase uppercase tracking-widest ${TONES.surface}`}
                            >
                                <span className="h-1.5 w-1.5 rounded-full bg-crimson-vivid" />
                                {slide.badge}
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="break-words font-display-hero-mobile text-display-hero-mobile uppercase leading-none tracking-tight text-surface-white drop-shadow-md md:font-display-hero md:text-display-hero"
                            >
                                {slide.line1}
                                <br />
                                <span className="text-crimson-vivid">{slide.accent}</span> {slide.rest}
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="max-w-xl font-body-lg text-body-lg text-secondary-fixed-dim"
                            >
                                {text}
                            </motion.p>

                            <motion.div
                                variants={itemVariants}
                                className="flex flex-wrap items-center gap-4 pt-4"
                            >
                                <a
                                    href="#rezervasyon"
                                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-container px-8 py-4 font-label-uppercase text-label-uppercase tracking-wider text-on-primary shadow-md transition-colors hover:bg-crimson-vivid"
                                >
                                    <span>{slide.cta}</span>
                                    <Icon
                                        name="arrow_forward"
                                        className="text-[18px] transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                                    />
                                </a>
                                <a
                                    href={altHref}
                                    {...(wa ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-charcoal-dark/40 px-6 py-4 font-label-uppercase text-label-uppercase tracking-wider text-surface-white backdrop-blur-sm transition-colors hover:bg-surface-white hover:text-charcoal-dark"
                                >
                                    <Icon name={slide.altIcon} className="text-[18px] text-crimson-vivid" />
                                    <span>{altLabel}</span>
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Kontroller */}
            <div className="absolute bottom-16 end-margin z-30 flex items-center gap-4 rounded-2xl bg-charcoal-dark/80 px-4 py-2 text-surface-white shadow-lg backdrop-blur-md md:end-margin-tablet lg:end-margin-desktop">
                <div className="font-label-uppercase text-label-uppercase tracking-widest" dir="ltr">
                    <span className="font-bold text-crimson-vivid">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mx-1 text-secondary-fixed-dim">/</span>
                    <span className="text-secondary-fixed-dim">
                        {String(slides.length).padStart(2, "0")}
                    </span>
                </div>
                <div className="h-4 w-px bg-charcoal-surface" />
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        aria-label={t.hero.prev}
                        onClick={() => go(-1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-crimson-vivid"
                    >
                        <Icon name={isRtl ? "east" : "west"} className="text-[18px]" />
                    </button>
                    <button
                        type="button"
                        aria-label={t.hero.next}
                        onClick={() => go(1)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-crimson-vivid"
                    >
                        <Icon name={isRtl ? "west" : "east"} className="text-[18px]" />
                    </button>
                </div>
            </div>
        </motion.section>
    );
}