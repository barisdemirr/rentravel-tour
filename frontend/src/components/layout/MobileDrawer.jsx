"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { IMG } from "@/lib/constants";
import { EASE } from "@/lib/motion";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";
import LanguageMenu from "../ui/LanguageMenu";

export default function MobileDrawer({ open, onClose }) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const closeRef = useRef(null);

    const isActive = (href) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

    const links = [
        { label: t.nav.home, href: "/" },
        { label: t.nav.dailyTours || "Günübirlik Turlar", href: "/tur-rezervasyonu?type=daily", sub: true },
        { label: t.nav.cultureTours || "Konaklamalı Kültür Turları", href: "/tur-rezervasyonu?type=culture", sub: true },
        { label: t.nav.cars, href: "/arac-kiralama" },
        { label: t.nav.bungalow, href: "/bungalov-konaklama" },
        { label: t.nav.about, href: "/hakkimizda" },
        { label: t.nav.contact, href: "/iletisim" },
    ];

    useEffect(() => { onClose(); /* eslint-disable-next-line */ }, [pathname]);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menü"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[60] flex h-dvh flex-col justify-between overflow-y-auto bg-charcoal-dark p-6 text-surface-white"
                >
                    <div className="flex items-center justify-between">
                        <SafeImage
                            src={IMG.logoMobile || IMG.logo}
                            alt="Rentravel"
                            className="h-10 w-auto object-contain"
                        />
                        <button
                            ref={closeRef}
                            type="button"
                            aria-label={t.nav.closeMenu}
                            onClick={onClose}
                            className="rounded-xl p-2 text-surface-white transition-colors hover:bg-white/10"
                        >
                            <Icon name="close" className="text-[32px]" />
                        </button>
                    </div>

                    <nav className="my-auto py-8">
                        <motion.ul
                            initial="hidden"
                            animate="show"
                            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                            className="flex flex-col gap-2"
                        >
                            {links.map((l) => (
                                <motion.li
                                    key={l.href}
                                    variants={{
                                        hidden: { opacity: 0, x: -24 },
                                        show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
                                    }}
                                >
                                    <Link
                                        href={l.href}
                                        onClick={onClose}
                                        aria-current={isActive(l.href) ? "page" : undefined}
                                        className={`block rounded-xl px-3 py-2 font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight transition-colors ${l.sub ? "text-surface-variant/80" : ""
                                            } ${isActive(l.href)
                                                ? "text-crimson-vivid"
                                                : "text-surface-variant hover:bg-white/5 hover:text-surface-white"
                                            }`}
                                    >
                                        {l.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </nav>

                    <div className="flex flex-col gap-4 pt-4">
                        <div className="flex items-center justify-between font-label-uppercase text-label-uppercase text-surface-variant">
                            <span>{t.nav.langSelect}</span>
                            <LanguageMenu variant="dark" />
                        </div>
                        <Link
                            href="/vip-talep"
                            onClick={onClose}
                            className="w-full rounded-xl bg-primary-container py-3.5 text-center font-label-uppercase text-label-uppercase tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid"
                        >
                            {t.nav.vipForm}
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}