"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "@/components/ui/LocalizedLink";
import { IMG } from "@/lib/constants";
import { stripLocale } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Icon from "../ui/Icon";
import LanguageMenu from "../ui/LanguageMenu";
import SafeImage from "../ui/SafeImage";

export default function Navbar({ onOpenMenu }) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [openMenu, setOpenMenu] = useState(null); // "tours" | "corporate" | null

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Sayfa değişince açılır menü kapanır */
    useEffect(() => {
        setOpenMenu(null);
    }, [pathname]);

    /* Dil öneki karşılaştırmaya girmesin: /en/arac-kiralama da aktif sayılmalı */
    const current = stripLocale(pathname) || "/";
    const isActive = (href) => (href === "/" ? current === "/" : current.startsWith(href));

    const tourLinks = [
        { label: t.nav.dailyTours, href: "/gunubirlik-turlar" },
        { label: t.nav.cultureTours, href: "/konaklamali-turlar" },
    ];

    const corporateLinks = [
        { label: t.nav.about, href: "/hakkimizda" },
        { label: t.nav.contact, href: "/iletisim" },
    ];

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-shadow duration-300 ${scrolled
                ? "bg-surface-white/95 shadow-[0_4px_24px_rgba(15,17,21,0.08)]"
                : "bg-surface-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                }`}
        >
            <div className="relative mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-margin md:h-20 md:px-margin-tablet lg:px-margin-desktop">
                {/* Hamburger: sadece telefon ve tablet */}
                <button
                    type="button"
                    aria-label={t.nav.openMenu}
                    onClick={onOpenMenu}
                    className="-ms-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-charcoal-dark transition-colors hover:bg-canvas-offwhite lg:hidden"
                >
                    <Icon name="menu" className="text-[28px]" />
                </button>

                {/* Logo: telefonda ortada, masaüstünde başta */}
                <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
                    <Link href="/" aria-label="Rentravel" className="flex items-center">
                        <SafeImage
                            src={IMG.logo}
                            alt="Rentravel Turizm"
                            className="h-9 w-auto object-contain md:h-10 lg:h-8"
                        />
                    </Link>
                </div>

                {/* Masaüstü menü: sayfanın tam ortasında */}
                <nav
                    aria-label="Ana menü"
                    className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-0.5 lg:flex"
                >
                    <NavItem href="/" active={isActive("/")}>
                        {t.nav.home}
                    </NavItem>

                    <Dropdown
                        label={t.nav.tours}
                        links={tourLinks}
                        isActive={isActive}
                        open={openMenu === "tours"}
                        onToggle={() => setOpenMenu((m) => (m === "tours" ? null : "tours"))}
                        onClose={() => setOpenMenu(null)}
                    />

                    <NavItem href="/arac-kiralama" active={isActive("/arac-kiralama")}>
                        {t.nav.cars}
                    </NavItem>

                    <NavItem href="/bungalov-konaklama" active={isActive("/bungalov-konaklama")}>
                        {t.nav.bungalow}
                    </NavItem>

                    <Dropdown
                        label={t.nav.corporate}
                        links={corporateLinks}
                        isActive={isActive}
                        open={openMenu === "corporate"}
                        onToggle={() => setOpenMenu((m) => (m === "corporate" ? null : "corporate"))}
                        onClose={() => setOpenMenu(null)}
                    />
                </nav>

                {/* Sağ taraf: masaüstünde en sağa yapışır */}
                <div className="flex shrink-0 items-center gap-1.5 lg:ms-auto lg:gap-3">
                    <LanguageMenu />

                    {/* VIP Talep butonu: SADECE masaüstünde (mobilde drawer içinde) */}
                    <Link
                        href="/vip-talep"
                        className="hidden items-center justify-center rounded-xl bg-primary-container px-4 py-2.5 font-label-uppercase text-label-uppercase tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid lg:inline-flex"
                    >
                        {t.nav.vipRequest}
                    </Link>
                </div>
            </div>
        </header>
    );
}

/* ── Menü bağlantısı ── */
function NavItem({ href, active, children }) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={`group relative inline-flex items-center rounded-lg px-2.5 py-2 font-label-uppercase text-label-uppercase uppercase transition-colors duration-200 ${active ? "text-crimson-vivid" : "text-on-surface-variant hover:text-crimson-vivid"
                }`}
        >
            {children}
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-2.5 bottom-0.5 h-[2px] origin-[left] rounded-full bg-crimson-vivid transition-transform duration-300 ease-out rtl:origin-[right] ${active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
            />
        </Link>
    );
}

/* ── Açılır menü: hover, tıklama ve klavye ile ── */
function Dropdown({ label, links, isActive, open, onToggle, onClose }) {
    const ref = useRef(null);
    const active = links.some((l) => isActive(l.href));

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => !ref.current?.contains(e.target) && onClose();
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    return (
        <div
            ref={ref}
            className="group relative"
            onMouseEnter={onToggle === undefined ? undefined : () => !open && onToggle()}
            onMouseLeave={onClose}
        >
            <button
                type="button"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={onToggle}
                className={`group/nav relative inline-flex items-center gap-1 rounded-lg px-2.5 py-2 font-label-uppercase text-label-uppercase uppercase transition-colors duration-200 ${active || open ? "text-crimson-vivid" : "text-on-surface-variant hover:text-crimson-vivid"
                    }`}
            >
                <span>{label}</span>
                <Icon
                    name="expand_more"
                    className={`text-[16px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
                <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-2.5 bottom-0.5 h-[2px] origin-[left] rounded-full bg-crimson-vivid transition-transform duration-300 ease-out rtl:origin-[right] ${active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                        }`}
                />
            </button>

            <div
                className={`absolute start-0 top-full z-50 min-w-[240px] overflow-hidden rounded-xl bg-surface-white p-1 shadow-[0_8px_24px_rgba(15,17,21,0.14)] transition-all duration-200 ${open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
                    }`}
            >
                {links.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        className={`block rounded-lg px-3 py-2.5 font-label-md text-label-md transition-colors hover:bg-canvas-offwhite hover:text-crimson-vivid ${isActive(l.href) ? "text-crimson-vivid" : "text-on-surface-variant"
                            }`}
                    >
                        {l.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}