"use client";

import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion";
import Icon from "../ui/Icon";
import TourCard from "../cards/TourCard";

export default function ToursGrid({ tours, variant, perPage, onPageChange }) {
    const [page, setPage] = useState(1);
    const [dir, setDir] = useState(1);

    const totalPages = Math.max(1, Math.ceil(tours.length / perPage));
    const visible = useMemo(() => {
        const start = (page - 1) * perPage;
        return tours.slice(start, start + perPage);
    }, [tours, page, perPage]);

    const goTo = (next) => {
        if (next < 1 || next > totalPages) return;
        setDir(next > page ? 1 : -1);
        setPage(next);
        /* Sadece kullanıcı pagination'a bastığında scroll et */
        onPageChange?.();
    };

    const startIdx = (page - 1) * perPage + 1;
    const endIdx = Math.min(page * perPage, tours.length);

    return (
        <div className="flex flex-col gap-10">
            {/* GRID */}
            <div className="overflow-hidden">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                    <motion.div
                        key={page}
                        custom={dir}
                        variants={{
                            enter: (d) => ({ opacity: 0, x: 40 * d }),
                            center: { opacity: 1, x: 0 },
                            exit: (d) => ({ opacity: 0, x: -40 * d }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.35, ease: EASE }}
                        className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6"
                    >
                        {visible.map((tour) => (
                            <TourCard key={tour.id} tour={tour} variant={variant} mode="grid" />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => goTo(page - 1)}
                            disabled={page === 1}
                            aria-label="Önceki sayfa"
                            className="flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-white px-4 py-2 font-label-md text-label-md text-secondary transition-colors hover:border-crimson-vivid hover:text-crimson-vivid disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-surface-variant disabled:hover:text-secondary"
                        >
                            <Icon name="chevron_left" className="text-[18px]" />
                            <span className="hidden sm:inline">Önceki</span>
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => {
                            const isActive = n === page;
                            return (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => goTo(n)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`flex h-10 w-10 items-center justify-center rounded-full font-headline-sm text-headline-sm font-bold transition-all ${isActive
                                            ? "bg-primary-container text-on-primary shadow-md shadow-primary-container/25"
                                            : "border border-surface-variant bg-surface-white text-charcoal-dark hover:border-crimson-vivid hover:text-crimson-vivid"
                                        }`}
                                >
                                    {n}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            onClick={() => goTo(page + 1)}
                            disabled={page === totalPages}
                            aria-label="Sonraki sayfa"
                            className="flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-white px-4 py-2 font-label-md text-label-md text-secondary transition-colors hover:border-crimson-vivid hover:text-crimson-vivid disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-surface-variant disabled:hover:text-secondary"
                        >
                            <span className="hidden sm:inline">Sonraki</span>
                            <Icon name="chevron_right" className="text-[18px]" />
                        </button>
                    </div>

                    <p className="font-body-sm text-body-sm text-secondary">
                        Toplam <strong className="text-charcoal-dark">{tours.length}</strong> turdan{" "}
                        <strong className="text-charcoal-dark">
                            {startIdx} - {endIdx}
                        </strong>{" "}
                        arası gösteriliyor
                    </p>
                </div>
            )}
        </div>
    );
}