"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IMG, SPLASH_DURATION, SPLASH_STORAGE_KEY } from "@/lib/constants";
import SafeImage from "./SafeImage";

export default function SplashScreen() {
    const [visible, setVisible] = useState(false);
    const [ready, setReady] = useState(false);

    // İlk mount'ta göster (session'da bir kez)
    useEffect(() => {
        if (typeof window === "undefined") return;

        const seen = sessionStorage.getItem(SPLASH_STORAGE_KEY);
        if (seen === "1") {
            setReady(true);
            return;
        }

        setVisible(true);
        const t = setTimeout(() => {
            setVisible(false);
            sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
        }, SPLASH_DURATION);

        return () => clearTimeout(t);
    }, []);

    // Splash açıkken scroll kilitle
    useEffect(() => {
        if (!visible) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [visible]);

    // İlk render'da seen değilse hemen visible yap (flash önlemek için)
    if (!ready && !visible) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    role="status"
                    aria-live="polite"
                    aria-label="Yükleniyor"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal-dark"
                >
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center gap-6"
                    >
                        <SafeImage
                            src={IMG.logoMobile || IMG.logo}
                            alt="Rentravel Turizm"
                            className="h-20 w-auto object-contain sm:h-24"
                        />

                        {/* 3 Nokta Animasyonu */}
                        <div className="flex items-center gap-2.5" aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="block h-2.5 w-2.5 rounded-full bg-crimson-vivid"
                                    animate={{
                                        y: [0, -10, 0],
                                        opacity: [0.4, 1, 0.4],
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.15,
                                    }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Alt yazı */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="absolute bottom-10 font-label-uppercase text-label-uppercase tracking-[0.3em] text-secondary-fixed-dim"
                    >
                        Rentravel Turizm
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}