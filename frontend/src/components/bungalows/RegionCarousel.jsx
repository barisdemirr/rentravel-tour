"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { BUNGALOW_REGIONS, bungalows } from "@/lib/mockData";
import SafeImage from "@/components/ui/SafeImage";

const AUTO_INTERVAL = 4000;

export default function RegionCarousel({ value, onChange }) {
    const containerRef = useRef(null);
    const pillsRef = useRef(null);
    const barRef = useRef(null);
    const inView = useInView(containerRef, { amount: 0.3 });
    const reduce = useReducedMotion();

    const [tabHidden, setTabHidden] = useState(false);
    const [paused, setPaused] = useState(false);

    const activeIndex = Math.max(
        0,
        BUNGALOW_REGIONS.findIndex((r) => r.value === value)
    );

    /* Her bölgenin ilk bungalovunu thumbnail olarak al */
    const regionsWithThumbs = useMemo(
        () =>
            BUNGALOW_REGIONS.map((r) => {
                const first = bungalows.find((b) => b.region === r.value);
                return { ...r, thumbnail: first?.image };
            }),
        []
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

        if (reduce || paused || tabHidden || !inView) return;

        void bar.offsetWidth;

        bar.style.transition = `transform ${AUTO_INTERVAL}ms linear`;
        bar.style.transform = "scaleX(1)";

        const timeout = setTimeout(() => {
            const next = (activeIndex + 1) % BUNGALOW_REGIONS.length;
            onChange(BUNGALOW_REGIONS[next].value);
        }, AUTO_INTERVAL);

        return () => {
            clearTimeout(timeout);
            bar.style.transition = "none";
        };
    }, [activeIndex, paused, tabHidden, inView, reduce, onChange]);

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
                    const isActive = region.value === value;
                    return (
                        <li key={region.value} className="shrink-0">
                            <button
                                type="button"
                                data-region={region.value}
                                onClick={() => handleSelect(region.value)}
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
                                    <SafeImage
                                        src={region.thumbnail}
                                        alt=""
                                        aria-hidden="true"
                                        className="h-full w-full object-cover"
                                    />
                                </span>

                                <span className="relative z-10 whitespace-nowrap pr-1 font-label-md text-label-md font-semibold">
                                    {region.shortLabel}
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}