"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Icon from "./Icon";

/* Mini bayraklar — inline SVG */
const FLAGS = {
    TR: (
        <svg viewBox="0 0 24 16" className="h-3.5 w-5 rounded-[3px]" aria-hidden="true">
            <rect width="24" height="16" fill="#E30A17" rx="2" />
            <circle cx="9.5" cy="8" r="4" fill="#fff" />
            <circle cx="10.8" cy="8" r="3.2" fill="#E30A17" />
            <path d="M14.2 8 L16.8 7.2 L15.4 8 L16.8 8.8 Z" fill="#fff" />
        </svg>
    ),
    AR: (
        <svg viewBox="0 0 24 16" className="h-3.5 w-5 rounded-[3px]" aria-hidden="true">
            <rect width="24" height="16" fill="#0B6E4F" rx="2" />
            <path d="M6 4 Q10 8 6 12" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M14 5 L18 5 M16 5 L16 11 M14 11 L18 11" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        </svg>
    ),
    EN: (
        <svg viewBox="0 0 24 16" className="h-3.5 w-5 rounded-[3px]" aria-hidden="true">
            <rect width="24" height="16" fill="#012169" rx="2" />
            <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3" />
            <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.4" />
            <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="4" />
            <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.2" />
        </svg>
    ),
};

export default function LanguageMenu({ variant = "light", hideIconOnMobile = false }) {
    const { lang, setLang, supported } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const triggerCls =
        variant === "dark"
            ? "bg-white/10 text-surface-white hover:bg-white/15"
            : "bg-canvas-offwhite text-charcoal-dark hover:bg-surface-variant";

    const itemCls = (isActive) =>
        variant === "dark"
            ? isActive
                ? "text-crimson-vivid bg-white/5"
                : "text-surface-variant hover:bg-white/5 hover:text-surface-white"
            : isActive
                ? "text-primary-container bg-canvas-offwhite"
                : "text-on-surface-variant hover:bg-canvas-offwhite hover:text-charcoal-dark";

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 font-label-uppercase text-label-uppercase transition-colors ${triggerCls}`}
            >
                {/* Dünya ikonu: mobilde gizle, 2xl'de göster */}
                <Icon
                    name="language"
                    className={`text-[16px] ${hideIconOnMobile ? "hidden 2xl:inline-block" : ""}`}
                />
                <span className="flex items-center gap-1.5">
                    {FLAGS[lang]}
                    <span>{lang}</span>
                </span>
                <Icon
                    name="arrow_drop_down"
                    className={`text-[14px] transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute end-0 top-full z-50 mt-2 min-w-[130px] overflow-hidden rounded-xl bg-surface-white p-1 shadow-[0_8px_24px_rgba(15,17,21,0.14)]"
                    >
                        {supported.map((l) => (
                            <li key={l}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLang(l);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start font-label-uppercase text-label-uppercase transition-colors ${itemCls(l === lang)}`}
                                >
                                    <span className="flex h-4 w-5 items-center justify-center">{FLAGS[l]}</span>
                                    <span>{l}</span>
                                </button>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}