"use client";

import { useEffect, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "./Icon";
import SafeImage from "./SafeImage";

export default function Lightbox({
    images = [],
    index = 0,
    open = false,
    onClose,
    onIndexChange,
}) {
    const [touchStartX, setTouchStartX] = useState(null);

    const total = images.length;

    const next = useCallback(() => {
        onIndexChange?.((index + 1) % total);
    }, [index, total, onIndexChange]);

    const prev = useCallback(() => {
        onIndexChange?.((index - 1 + total) % total);
    }, [index, total, onIndexChange]);

    /* Klavye */
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            else if (e.key === "ArrowRight") next();
            else if (e.key === "ArrowLeft") prev();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, next, prev]);

    /* Scroll kilidi */
    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [open]);

    /* Touch swipe */
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };
    const handleTouchEnd = (e) => {
        if (touchStartX == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (dx > 60) prev();
        else if (dx < -60) next();
        setTouchStartX(null);
    };

    const current = images[index];

    return (
        <AnimatePresence>
            {open && current && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Fotoğraf galerisi"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[80] flex flex-col bg-black/95 backdrop-blur-md"
                    onClick={onClose}
                >
                    {/* ÜST BAR */}
                    <div
                        className="flex items-center justify-between px-4 py-3 text-white sm:px-6 sm:py-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 font-label-uppercase text-label-uppercase font-bold backdrop-blur-md">
                            <Icon name="photo_library" className="text-[16px] text-crimson-vivid" />
                            <span>
                                {index + 1} / {total}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Kapat"
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-crimson-vivid"
                        >
                            <Icon name="close" className="text-[24px]" />
                        </button>
                    </div>

                    {/* GÖRSEL ALANI */}
                    <div
                        className="relative flex flex-1 items-center justify-center px-2 sm:px-6"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.25 }}
                                className="relative max-h-full max-w-full"
                            >
                                <SafeImage
                                    src={current.src}
                                    alt={current.title || ""}
                                    className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Prev / Next (desktop) */}
                        {total > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        prev();
                                    }}
                                    aria-label="Önceki görsel"
                                    className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-crimson-vivid sm:flex"
                                >
                                    <Icon name="chevron_left" className="text-[28px]" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        next();
                                    }}
                                    aria-label="Sonraki görsel"
                                    className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-crimson-vivid sm:flex"
                                >
                                    <Icon name="chevron_right" className="text-[28px]" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* ALT AÇIKLAMA */}
                    {(current.title || current.subtitle) && (
                        <div
                            className="px-4 pb-6 pt-2 text-center text-white sm:px-6 sm:pb-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {current.title && (
                                <h4 className="font-headline-sm text-headline-sm font-bold">
                                    {current.title}
                                </h4>
                            )}
                            {current.subtitle && (
                                <p className="mt-1 font-body-sm text-body-sm text-white/70">
                                    {current.subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}