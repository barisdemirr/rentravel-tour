"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Link from "@/components/ui/LocalizedLink";
import { IMG, SITE, waHref } from "@/lib/constants";
import { stripLocale } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { EASE } from "@/lib/motion";
import { infoMessage } from "@/lib/whatsapp";
import Icon from "../ui/Icon";
import LanguageMenu from "../ui/LanguageMenu";
import SafeImage from "../ui/SafeImage";

export default function MobileDrawer({ open, onClose, pages = [] }) {
    const { t, locale } = useLanguage();
    const pathname = usePathname();
    const closeRef = useRef(null);

    /* Dil öneki karşılaştırmaya girmesin */
    const current = stripLocale(pathname) || "/";
    const isActive = (href) => (href === "/" ? current === "/" : current.startsWith(href));

    /* Ana gruplar: başlık + alt maddeler */
    const groups = [
        { items: [{ label: t.nav.home, href: "/", icon: "home" }] },
        {
            title: t.nav.tours,
            items: [
                { label: t.nav.dailyTours, href: "/gunubirlik-turlar", icon: "hiking" },
                { label: t.nav.cultureTours, href: "/konaklamali-turlar", icon: "castle" },
            ],
        },
        {
            items: [
                { label: t.nav.cars, href: "/arac-kiralama", icon: "directions_car" },
                { label: t.nav.bungalow, href: "/bungalov-konaklama", icon: "cottage" },
            ],
        },
        {
            title: t.nav.corporate,
            items: [
                { label: t.nav.about, href: "/hakkimizda", icon: "info" },
                { label: t.nav.contact, href: "/iletisim", icon: "mail" },
            ],
        },
    ];

    useEffect(() => {
        onClose();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        if (!open) return;

        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        closeRef.current?.focus();

        return () => {
            // Çıkış animasyonu bitince bırakılır, sayfa zıplamaz
            setTimeout(() => {
                document.body.style.overflow = previous;
            }, 250);
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    const whatsapp = waHref(infoMessage({ locale }));

    /* Yukarıdan aşağı sırayla, soldan sağa kayarak girer */
    const item = {
        hidden: { opacity: 0, x: -24 },
        show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    role="dialog"
                    aria-modal="true"
                    aria-label={t.nav.openMenu}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed inset-0 z-[60] flex h-dvh flex-col bg-charcoal-dark text-surface-white"
                >
                    {/* Üst çubuk: sabit */}
                    <div className="flex shrink-0 items-center justify-between px-5 py-4">
                        <SafeImage
                            src={IMG.logoMobile || IMG.logo}
                            alt="Rentravel"
                            className="h-11 w-auto object-contain"
                        />
                        <button
                            ref={closeRef}
                            type="button"
                            aria-label={t.nav.closeMenu}
                            onClick={onClose}
                            className="-me-2 flex h-11 w-11 items-center justify-center rounded-xl text-surface-white transition-colors hover:bg-white/10"
                        >
                            <Icon name="close" className="text-[28px]" />
                        </button>
                    </div>

                    {/* Menü: kaydırılabilir */}
                    <nav className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
                        <motion.div
                            initial="hidden"
                            animate="show"
                            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
                            className="flex flex-col gap-5"
                        >
                            {groups.map((group, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    {group.title && (
                                        <motion.span
                                            variants={item}
                                            className="px-3 pb-1 font-label-uppercase text-label-uppercase font-bold tracking-wider text-surface-variant/50"
                                        >
                                            {group.title}
                                        </motion.span>
                                    )}

                                    {group.items.map((link) => (
                                        <motion.div key={link.href} variants={item}>
                                            <Link
                                                href={link.href}
                                                onClick={onClose}
                                                aria-current={isActive(link.href) ? "page" : undefined}
                                                className={`flex items-center gap-3 rounded-xl px-3 py-3 font-headline-sm text-headline-sm font-bold uppercase tracking-tight transition-colors ${isActive(link.href)
                                                    ? "bg-white/5 text-crimson-vivid"
                                                    : "text-surface-variant hover:bg-white/5 hover:text-surface-white"
                                                    }`}
                                            >
                                                <Icon name={link.icon} className="shrink-0 text-[22px]" />
                                                <span className="min-w-0 truncate">{link.label}</span>
                                                <Icon
                                                    name="chevron_right"
                                                    className="ms-auto shrink-0 text-[18px] opacity-40 rtl:-scale-x-100"
                                                />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            ))}

                            {/* VIP Talep: menü maddesi olarak */}
                            <motion.div variants={item}>
                                <Link
                                    href="/vip-talep"
                                    onClick={onClose}
                                    aria-current={isActive("/vip-talep") ? "page" : undefined}
                                    className={`flex items-center gap-3 rounded-xl bg-primary-container px-3 py-3 font-headline-sm text-headline-sm font-bold uppercase tracking-tight text-on-primary transition-colors hover:bg-crimson-vivid ${isActive("/vip-talep") ? "ring-2 ring-crimson-vivid ring-offset-2 ring-offset-charcoal-dark" : ""
                                        }`}
                                >
                                    <Icon name="workspace_premium" className="shrink-0 text-[22px]" />
                                    <span className="min-w-0 truncate">{t.nav.vipForm}</span>
                                    <Icon
                                        name="chevron_right"
                                        className="ms-auto shrink-0 text-[18px] opacity-80 rtl:-scale-x-100"
                                    />
                                </Link>
                            </motion.div>

                            {/* Panelden eklenen statik sayfalar */}
                            {pages.length > 0 && (
                                <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
                                    {pages.map((page) => (
                                        <motion.div key={page.slug} variants={item}>
                                            <Link
                                                href={`/${page.slug}`}
                                                onClick={onClose}
                                                className="block rounded-xl px-3 py-2 font-body-sm text-body-sm text-surface-variant/70 transition-colors hover:bg-white/5 hover:text-surface-white"
                                            >
                                                {page.title?.[locale] || page.title?.tr}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </nav>

                    {/* Alt: sabit eylemler (VIP Talep kaldırıldı, artık menüde) */}
                    <div className="shrink-0 border-t border-white/10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                        <div className="mb-3 flex items-center justify-between font-label-uppercase text-label-uppercase text-surface-variant/70">
                            <span>{t.nav.langSelect}</span>
                            <LanguageMenu variant="dark" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={whatsapp ?? "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 py-3 font-label-md text-label-md font-semibold text-surface-white transition-colors hover:bg-white/10"
                            >
                                <Icon name="chat" className="text-[18px] text-emerald-400" />
                                WhatsApp
                            </a>
                            <a
                                href={SITE.phoneHref}
                                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 py-3 font-label-md text-label-md font-semibold text-surface-white transition-colors hover:bg-white/10"
                            >
                                <Icon name="call" className="text-[18px] text-crimson-vivid" />
                                <span dir="ltr" className="truncate">
                                    {SITE.phone}
                                </span>
                            </a>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}