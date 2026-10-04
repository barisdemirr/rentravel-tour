"use client";

import { motion } from "framer-motion";
import { IMG } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import SafeImage from "./SafeImage";

/**
 * Splash görünümü: ilk açılışta (SplashScreen) ve sayfa yüklemelerinde (loading.jsx) aynı ekran.
 * delay: saniye. Verilirse ekran önce şeffaf kalır, hızlı yüklemelerde hiç belirmez.
 */
export default function SplashView({ delay = 0, className = "" }) {
    const { t } = useLanguage();

    return (
        <motion.div
            role="status"
            aria-live="polite"
            aria-label={t.common.loading}
            initial={{ opacity: delay ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut", delay: 0 } }}
            transition={{ duration: delay ? 0.25 : 0.5, ease: "easeInOut", delay }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal-dark ${className}`}
        >
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
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
                            animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* Alt yazı */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.4, duration: 0.5 }}
                className="absolute bottom-10 font-label-uppercase text-label-uppercase tracking-[0.3em] text-secondary-fixed-dim"
            >
                Rentravel Turizm
            </motion.p>
        </motion.div>
    );
}