"use client";

import { useEffect, useRef, useState } from "react";

/** Backend görsellerinin küçük (200px) varyantı: önce bu, bulanık olarak gösterilir */
const THUMB = /_(lg|md)\.webp(\?.*)?$/i;
export const placeholderOf = (src) => (typeof src === "string" && THUMB.test(src) ? src.replace(THUMB, "_thumb.webp$2") : null);

/**
 * Görsel: yüklenemezse yer tutucu gösterir. İLERLEMELİ YÜKLEME (blur-up):
 *  - Görsel inene kadar aynı görselin küçük (_thumb.webp) hali bulanık arka plan olarak gösterilir;
 *    görsel yüklenince bulanıklık yavaşça kalkar. Böylece alan hiçbir zaman boş kalmaz.
 *  - Küçük varyant yoksa (dış adres vb.) nötr zemin üzerinde aynı geçiş uygulanır.
 *  - Tarayıcı önbelleğindeki görsel (hidrasyondan önce yüklenmiş) anında net gösterilir.
 * SEO: gerçek <img> etiketi, alt metni ve src'si değişmez; arama motorları ve paylaşım önizlemeleri tam görseli görür.
 *
 * placeholder: küçük görsel adresi (verilmezse src'den türetilir; false = kapalı)
 * onLoaded: görsel yüklenince çağrılır
 */
export default function SafeImage({
    src,
    alt = "",
    className = "",
    fallbackClassName = "",
    placeholder,
    style,
    onLoad,
    onLoaded,
    ...rest
}) {
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const ref = useRef(null);

    // src değişince yeniden bulanık başla
    useEffect(() => {
        setFailed(false);
        const img = ref.current;
        // Önbellekten gelen görsel: onLoad React bağlanmadan önce tetiklenmiş olabilir
        const done = Boolean(img && img.complete && img.naturalWidth > 0);
        setLoaded(done);
        if (done) onLoaded?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    if (failed || !src) {
        return (
            <div
                aria-hidden="true"
                className={`${className} ${fallbackClassName} flex items-center justify-center bg-charcoal-surface`}
            >
                <span className="material-symbols-outlined text-[40px] text-surface-white/30">
                    image
                </span>
            </div>
        );
    }

    const thumb = placeholder === false ? null : placeholder ?? placeholderOf(src);
    const blurStyle = loaded
        ? { filter: "blur(0)", transition: "filter 600ms ease-out" }
        : {
              filter: "blur(18px)",
              backgroundColor: "rgba(120,120,120,0.18)",
              ...(thumb ? { backgroundImage: `url("${thumb}")`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
          };

    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            ref={ref}
            src={src}
            alt={alt}
            decoding="async"
            className={className}
            style={{ ...blurStyle, ...style }}
            onLoad={(e) => {
                setLoaded(true);
                onLoaded?.();
                onLoad?.(e);
            }}
            onError={() => setFailed(true)}
            {...rest}
        />
    );
}
