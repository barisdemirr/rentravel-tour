"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import SafeImage from "@/components/ui/SafeImage";

const AUTO_INTERVAL = 4000;

/* Dil fallback */
const localized = (field, lang = "tr") => {
    if (!field) return "";
    if (typeof field === "string") return field;
    return field[lang] || field.tr || "";
};

export default function RegionCarousel({
    regions = [],
    bungalows = [],
    value,
    onChange,
}) {
    const containerRef = useRef(null);
    const pillsRef = useRef(null);
    const barRef = useRef(null);
    const inView = useInView(containerRef, { amount: 0.3 });
    const reduce = useReducedMotion();

    const [tabHidden, setTabHidden] = useState(false);
    const [paused, setPaused] = useState(false);

    const activeIndex = Math.max(
        0,
        regions.findIndex((r) => r.key === value)
    );

    /* Backend'den gelen bölgeye thumbnail ekle (null ise o bölgedeki ilk bungalovun görseli) */
    const regionsWithThumbs = useMemo(
        () =>
            regions.map((r) => {
                const thumb =
                    r.thumbnail?.url ||
                    bungalows.find((b) => b.region === r.key)?.image;
                return { ...r, thumbnailUrl: thumb };
            }),
        [regions, bungalows]
    );

    useEffect(() => {
        const on = () => setTabHidden(document.hidden);
        document.addEventListener("visibilitychange", on);
        return () => document.removeEventListener("visibilitychange", on);
    }, []);

    useEffect(() => {
        const list = pillsRef.current;
        if (!list) return;
        const el = list.querySelector(`[data-region="${value}"]`);
        if (!el) return;
        if (list.scrollWidth > list.clientWidth + 8) {
            const target = el.offsetLeft - (list.clientWidth - el.clientWidth) / 2;
            list.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
        }
    }, [value]);

    useEffect(() => {
        const bar = barRef.current;
        if (!bar) return;

        bar.style.transition = "none";
        bar.style.transform = "scaleX(0)";

        if (reduce || paused || tabHidden || !inView || regions.length === 0) return;

        void bar.offsetWidth;

        bar.style.transition = `transform ${AUTO_INTERVAL}ms linear`;
        bar.style.transform = "scaleX(1)";

        const timeout = setTimeout(() => {
            const next = (activeIndex + 1) % regions.length;
            onChange(regions[next].key);
        }, AUTO_INTERVAL);

        return () => {
            clearTimeout(timeout);
            bar.style.transition = "none";
        };
    }, [activeIndex, paused, tabHidden, inView, reduce, onChange, regions]);

    const handleSelect = useCallback(
        (nextValue) => {
            if (nextValue === value) {
                const bar = barRef.current;
                if (bar) {
                    bar.style.transition = "none";
                    bar.style.transform = "scaleX(0)";
                    void bar.offsetWidth;
                }
            }
            onChange(nextValue);
        },
        [value, onChange]
    );

    /* Backend boş dönerse hiç render etme */
    if (!regions || regions.length === 0) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="rounded-3xl border border-surface-variant/80 bg-surface-white/85 p-2 shadow-md backdrop-blur-md sm:p-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
            role="region"
            aria-label="Bungalov bölgeleri"
        >
            <ul
                ref={pillsRef}
                className="no-scrollbar flex items-center gap-2 overflow-x-auto sm:gap-2.5"
            >
                {regionsWithThumbs.map((region) => {
                    const isActive = region.key === value;
                    return (
                        <li key={region.id} className="shrink-0">
                            <button
                                type="button"
                                data-region={region.key}
                                onClick={() => handleSelect(region.key)}
                                aria-current={isActive ? "true" : undefined}
                                className={`relative flex items-center gap-2 overflow-hidden rounded-full py-1.5 pl-1.5 pr-3.5 transition-colors ${isActive
                                    ? "bg-primary-container text-on-primary shadow-sm"
                                    : "bg-canvas-offwhite text-charcoal-dark hover:bg-surface-variant"
                                    }`}
                            >
                                {isActive && (
                                    <span
                                        ref={barRef}
                                        aria-hidden="true"
                                        className="pointer-events-none absolute inset-0 origin-left rounded-full bg-black/15"
                                        style={{ transform: "scaleX(0)" }}
                                    />
                                )}

                                <span className="relative z-10 h-7 w-7 shrink-0 overflow-hidden rounded-full border border-white/60">
                                    {region.thumbnailUrl ? (
                                        <SafeImage
                                            src={region.thumbnailUrl}
                                            alt=""
                                            aria-hidden="true"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center bg-canvas-offwhite">
                                            <span className="material-symbols-outlined text-[14px] text-secondary">
                                                image
                                            </span>
                                        </span>
                                    )}
                                </span>

                                <span className="relative z-10 whitespace-nowrap pr-1 font-label-md text-label-md font-semibold">
                                    {localized(region.shortLabel)}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}