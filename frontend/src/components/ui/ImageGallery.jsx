"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { mediaAlt, mediaUrl } from "@/lib/media";
import Icon from "./Icon";
import SafeImage from "./SafeImage";

/**
 * Detay sayfası galerisi (tur, bungalov): büyük görsel + küçük resimler + tam ekran görüntüleyici.
 *  - Mobil: büyük görsel parmakla kaydırılarak (swipe) değişir (yerel kaydırma + snap; akıcı ve erişilebilir).
 *  - Masaüstü: önceki / sonraki okları büyük görselin üzerinde her zaman görünür; görsele tıklayınca tam ekran açılır.
 *  - Görseller önce bulanık küçük hâliyle görünür, yüklendikçe netleşir (SafeImage). Tam ekranda yükleme göstergesi vardır;
 *    komşu görseller önceden yüklenir, böylece geçişte boş ekran kalmaz.
 * images: backend MediaItem listesi
 */
export default function ImageGallery({ images = [], title = "" }) {
    const { t, tpl, locale, isRtl } = useLanguage();
    const g = t.tourDetail;
    const count = images.length;

    const [active, setActive] = useState(0);
    const [open, setOpen] = useState(false);
    const [loadedIndex, setLoadedIndex] = useState(-1); // tam ekranda yüklenmiş görselin sırası
    const trackRef = useRef(null);
    const touchX = useRef(null);
    const sign = isRtl ? -1 : 1;

    const go = useCallback((dir) => setActive((i) => (i + dir + count) % count), [count]);

    /* Büyük görsel şeridi: etkin görsel değişince (ok, küçük resim, tam ekran) şeridi o görsele kaydır */
    useEffect(() => {
        const el = trackRef.current;
        if (!el || !el.clientWidth) return;
        const current = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
        if (current !== active) el.scrollTo({ left: sign * active * el.clientWidth, behavior: "smooth" });
    }, [active, sign]);

    /* Kullanıcı şeridi parmakla kaydırınca etkin görseli güncelle */
    const onTrackScroll = () => {
        const el = trackRef.current;
        if (!el || !el.clientWidth) return;
        const index = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
        if (index !== active && index >= 0 && index < count) setActive(index);
    };

    /* Komşu görselleri önceden yükle (geçişte bekleme olmasın) */
    useEffect(() => {
        if (count < 2 || typeof window === "undefined") return;
        [active + 1, active - 1].forEach((i) => {
            const img = new window.Image();
            img.decoding = "async";
            img.src = mediaUrl(images[(i + count) % count]);
        });
    }, [active, count, images]);

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

    const arrow = "flex h-11 w-11 items-center justify-center rounded-full bg-surface-white/90 text-charcoal-dark shadow-lg backdrop-blur-md transition-colors hover:bg-crimson-vivid hover:text-surface-white";

    return (
        <div className="flex flex-col gap-2.5" role="region" aria-roledescription="carousel" aria-label={g.galleryLabel}>
            {/* Büyük görsel: mobilde kaydırılabilir şerit, masaüstünde oklar her zaman görünür */}
            <div className="relative">
                <div
                    ref={trackRef}
                    onScroll={onTrackScroll}
                    className="no-scrollbar flex aspect-[4/3] w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden rounded-3xl bg-charcoal-dark shadow-sm sm:aspect-[16/10] lg:aspect-[2/1]"
                >
                    {images.map((img, i) => (
                        <button
                            key={img.id ?? i}
                            type="button"
                            onClick={() => {
                                setActive(i);
                                setOpen(true);
                            }}
                            aria-label={`${title} · ${tpl(g.photos, { count: i + 1 })}`}
                            className="group relative h-full w-full shrink-0 snap-center snap-always cursor-zoom-in overflow-hidden"
                        >
                            <SafeImage
                                src={mediaUrl(img)}
                                alt={mediaAlt(img, locale, title)}
                                loading={i === 0 ? "eager" : "lazy"}
                                fetchPriority={i === 0 ? "high" : undefined}
                                draggable={false}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        </button>
                    ))}
                </div>

                {count > 1 && (
                    <>
                        {/* Masaüstü okları: her zaman görünür */}
                        <button type="button" aria-label={t.common.prev} onClick={() => go(-1)} className={`${arrow} absolute start-3 top-1/2 hidden -translate-y-1/2 md:flex`}>
                            <Icon name="chevron_left" className="text-[26px] rtl:-scale-x-100" />
                        </button>
                        <button type="button" aria-label={t.common.next} onClick={() => go(1)} className={`${arrow} absolute end-3 top-1/2 hidden -translate-y-1/2 md:flex`}>
                            <Icon name="chevron_right" className="text-[26px] rtl:-scale-x-100" />
                        </button>

                        {/* Sayaç + mobilde kaydırma ipucu (noktalar) */}
                        <span
                            dir="ltr"
                            className="pointer-events-none absolute bottom-3 end-3 inline-flex items-center gap-1.5 rounded-full bg-surface-white/90 px-3 py-1.5 font-label-md text-label-md font-semibold text-charcoal-dark shadow-lg backdrop-blur-md"
                        >
                            <Icon name="grid_view" className="text-[14px] text-crimson-vivid" />
                            {active + 1} / {count}
                        </span>
                        {count <= 12 && (
                            <span className="pointer-events-none absolute bottom-4 start-1/2 flex -translate-x-1/2 gap-1.5 md:hidden" aria-hidden="true">
                                {images.map((_, i) => (
                                    <span key={i} className={`h-1.5 rounded-full transition-all ${i === active ? "w-4 bg-surface-white" : "w-1.5 bg-surface-white/60"}`} />
                                ))}
                            </span>
                        )}
                    </>
                )}
            </div>

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
                            <SafeImage src={mediaUrl(img, "thumb")} alt="" loading="lazy" placeholder={false} className="h-full w-full object-cover" />
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

                    {/* Görsel alanı sabit boyutludur: görsel inmeden de bulanık önizleme ve yükleme göstergesi görünür */}
                    <div className="relative h-[85svh] w-full px-14 sm:px-20" onClick={(e) => e.stopPropagation()}>
                        <SafeImage
                            key={active}
                            src={mediaUrl(current)}
                            alt={mediaAlt(current, locale, title)}
                            onLoaded={() => setLoadedIndex(active)}
                            className="h-full w-full object-contain"
                            style={{ backgroundSize: "contain", backgroundRepeat: "no-repeat" }}
                        />
                        {loadedIndex !== active && (
                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                                <span className="h-10 w-10 animate-spin rounded-full border-4 border-white/25 border-t-white" />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
