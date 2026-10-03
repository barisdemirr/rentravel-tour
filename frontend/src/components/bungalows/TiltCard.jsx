"use client";

import { useRef, useCallback } from "react";

/**
 * 3D tilt sarmalayıcı.
 * - Desktop: mouse pozisyonuna göre rotateX / rotateY
 * - Mobil: dokunma pozisyonuna göre hafif parallax (dokunma kalkınca sıfırlanır)
 * - prefers-reduced-motion: hiç tilt yapma
 */
export default function TiltCard({
    children,
    max = 8, // maksimum derece
    scale = 1.015, // hover'da hafif büyüme
    className = "",
}) {
    const wrapperRef = useRef(null);

    const setTransform = useCallback(
        (px, py) => {
            const el = wrapperRef.current;
            if (!el) return;

            // px, py: -1..1 arası normalize edilmiş offset
            const rotateY = (px * max).toFixed(2);
            const rotateX = (-py * max).toFixed(2);

            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
        },
        [max, scale]
    );

    const reset = useCallback(() => {
        const el = wrapperRef.current;
        if (!el) return;
        el.style.transform =
            "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    }, []);

    const onMove = (e) => {
        const el = wrapperRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width; // 0..1
        const y = (e.clientY - rect.top) / rect.height; // 0..1
        const px = (x - 0.5) * 2; // -1..1
        const py = (y - 0.5) * 2;
        setTransform(px, py);
    };

    const onTouchMove = (e) => {
        const el = wrapperRef.current;
        if (!el) return;
        const touch = e.touches[0];
        if (!touch) return;
        const rect = el.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        const y = (touch.clientY - rect.top) / rect.height;
        // Mobilde daha hafif etki (max'ın yarısı)
        const px = (x - 0.5) * 2;
        const py = (y - 0.5) * 2;
        const rotateY = (px * (max * 0.5)).toFixed(2);
        const rotateX = (-py * (max * 0.5)).toFixed(2);
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    return (
        <div
            ref={wrapperRef}
            onMouseMove={onMove}
            onMouseLeave={reset}
            onTouchMove={onTouchMove}
            onTouchEnd={reset}
            onTouchCancel={reset}
            className={`will-change-transform ${className}`}
            style={{
                transformStyle: "preserve-3d",
                transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
        >
            {children}
        </div>
    );
}