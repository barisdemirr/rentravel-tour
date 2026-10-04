"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { mediaAlt, mediaUrl } from "@/lib/media";
import Icon from "./Icon";
import SafeImage from "./SafeImage";

/** images: backend MediaItem listesi. Büyük görsel + küçük resimler + tam ekran görüntüleyici. */
export default function ImageGallery({ images = [], title = "" }) {
    const { t, tpl, locale, isRtl } = useLanguage();
    const g = t.tourDetail;
    const count = images.length;

    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const touchX = useRef(null);

    const go = useCallback((dir) => setActive((i) => (i + dir + count) % count), [count]);

    /* Tam ekranda: klavye, kaydırma kilidi */
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowRight") go(isRtl ? -1 : 1);
            if (e.key === "ArrowLeft") go(isRtl ? 1 : -1);
        };
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [open, go, isRtl]);

    if (count === 0) return null;

    const current = images[active];

    const onTouchEnd = (e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 50) return;
        // Sola kaydırma: LTR'de sonraki, RTL'de önceki
        go(dx < 0 ? (isRtl ? -1 : 1) : isRtl ? 1 : -1);
    };

    return (
        <div className="flex flex-col gap-2.5" role="region" aria-label={g.galleryLabel}>
            {/* Büyük görsel */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="group relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-3xl bg-charcoal-dark shadow-sm sm:aspect-[16/10] lg:aspect-[2/1]"
            >
                <SafeImage
                    src={mediaUrl(current)}
                    alt={mediaAlt(current, locale, title)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {count > 1 && (
                    <span
                        dir="ltr"
                        className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-surface-white/90 px-3 py-1.5 font-label-md text-label-md font-semibold text-charcoal-dark shadow-lg backdrop-blur-md"
                    >
                        <Icon name="grid_view" className="text-[14px] text-crimson-vivid" />
                        {active + 1} / {count}
                    </span>
                )}
            </button>

            {/* Küçük resimler */}
            {count > 1 && (
                <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
                    {images.map((img, i) => (
                        <button
                            key={img.id ?? i}
                            type="button"
                            onClick={() => setActive(i)}
                            aria-label={tpl(g.photos, { count: i + 1 })}
                            aria-current={i === active}
                            className={`h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-surface-white ring-2 transition-all sm:h-16 sm:w-24 ${i === active ? "ring-crimson-vivid" : "opacity-70 ring-transparent hover:opacity-100"
                                }`}
                        >
                            <SafeImage src={mediaUrl(img, "thumb")} alt="" className="h-full w-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Tam ekran */}
            {open && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={g.galleryLabel}
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
                    onClick={() => setOpen(false)}
                    onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
                    onTouchEnd={onTouchEnd}
                >
                    <button
                        type="button"
                        aria-label={g.close}
                        onClick={() => setOpen(false)}
                        className="absolute end-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                    >
                        <Icon name="close" className="text-[24px]" />
                    </button>

                    <span
                        dir="ltr"
                        className="absolute start-3 top-5 z-10 font-label-md text-label-md font-semibold text-white/90"
                    >
                        {active + 1} / {count}
                    </span>

                    {count > 1 && (
                        <>
                            <button
                                type="button"
                                aria-label={t.common.prev}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    go(-1);
                                }}
                                className="absolute start-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:start-4"
                            >
                                <Icon name="chevron_left" className="text-[26px] rtl:-scale-x-100" />
                            </button>
                            <button
                                type="button"
                                aria-label={t.common.next}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    go(1);
                                }}
                                className="absolute end-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/30 sm:end-4"
                            >
                                <Icon name="chevron_right" className="text-[26px] rtl:-scale-x-100" />
                            </button>
                        </>
                    )}

                    <SafeImage
                        src={mediaUrl(current)}
                        alt={mediaAlt(current, locale, title)}
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[85svh] max-w-full object-contain px-14 sm:px-20"
                    />
                </div>
            )}
        </div>
    );
}