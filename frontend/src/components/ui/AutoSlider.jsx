"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Icon from "./Icon";

const AUTO_INTERVAL = 3000;

export default function AutoSlider({
    children,
    ariaLabel = "İçerik kaydırıcı",
    className = "",
    showControls = true,
}) {
    const trackRef = useRef(null);
    const sectionRef = useRef(null);
    const reduce = useReducedMotion();
    const inView = useInView(sectionRef, { amount: 0.2 });
    const [tabHidden, setTabHidden] = useState(false);
    const [paused, setPaused] = useState(false);
    const [canScroll, setCanScroll] = useState(false);

    // Tab gizliyken durdur
    useEffect(() => {
        const on = () => setTabHidden(document.hidden);
        document.addEventListener("visibilitychange", on);
        return () => document.removeEventListener("visibilitychange", on);
    }, []);

    // Scroll edilebilir mi kontrol (tek kart varsa oklar gizlensin)
    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const check = () => setCanScroll(el.scrollWidth > el.clientWidth + 8);
        check();
        const ro = new ResizeObserver(check);
        ro.observe(el);
        return () => ro.disconnect();
    }, [children]);

    // Tek kart genişliği + gap hesapla
    const getStep = useCallback(() => {
        const el = trackRef.current;
        if (!el || !el.firstElementChild) return 0;
        const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
        return el.firstElementChild.getBoundingClientRect().width + gap;
    }, []);

    const scrollNext = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const step = getStep();
        if (!step) return;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
        if (atEnd) {
            el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
            el.scrollBy({ left: step, behavior: "smooth" });
        }
    }, [getStep]);

    const scrollPrev = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        const step = getStep();
        if (!step) return;
        const atStart = el.scrollLeft <= 8;
        if (atStart) {
            el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
        } else {
            el.scrollBy({ left: -step, behavior: "smooth" });
        }
    }, [getStep]);

    // Auto-scroll döngüsü
    useEffect(() => {
        if (reduce || paused || tabHidden || !inView || !canScroll) return;
        const id = setInterval(scrollNext, AUTO_INTERVAL);
        return () => clearInterval(id);
    }, [reduce, paused, tabHidden, inView, canScroll, scrollNext]);

    const active = inView && !paused && !tabHidden;

    return (
        <div
            ref={sectionRef}
            className={`relative ${className}`}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
            role="region"
            aria-label={ariaLabel}
            aria-live={active ? "off" : "polite"}
        >
            {/* Oklar */}
            {showControls && canScroll && (
                <div className="pointer-events-none absolute -top-14 right-0 hidden items-center gap-2 md:flex">
                    <button
                        type="button"
                        aria-label="Önceki"
                        onClick={scrollPrev}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-white text-charcoal-dark shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary"
                    >
                        <Icon name="chevron_left" className="text-[20px]" />
                    </button>
                    <button
                        type="button"
                        aria-label="Sonraki"
                        onClick={scrollNext}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-surface-white text-charcoal-dark shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary"
                    >
                        <Icon name="chevron_right" className="text-[20px]" />
                    </button>
                </div>
            )}

            {/* Track */}
            <div
                ref={trackRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
            >
                {children}
            </div>
        </div>
    );
}