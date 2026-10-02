"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { IMG, HOVER_RED } from "@/lib/constants";
import Icon from "../ui/Icon";
import NavLink from "../ui/NavLink";
import LanguageMenu from "../ui/LanguageMenu";
import SafeImage from "../ui/SafeImage";

/* Turlar dropdown içeriği */
const TOUR_LINKS = [
    { key: "daily", href: "/tur-rezervasyonu?type=daily" },
    { key: "culture", href: "/tur-rezervasyonu?type=culture" },
];

export default function Navbar({ onOpenMenu }) {
    const { t } = useLanguage();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isActive = (href) =>
        href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]);

    const navLinks = [
        { label: t.nav.home, href: "/" },
        { label: t.nav.cars, href: "/arac-kiralama" },
        { label: t.nav.bungalow, href: "/bungalov-konaklama" },
    ];

    const corporateLinks = [
        { label: t.nav.about, href: "/hakkimizda" },
        { label: t.nav.contact, href: "/iletisim" },
    ];

    // Turlar dropdown item'ları dile göre
    const tourLinks = [
        { label: t.nav.dailyTours || "Günübirlik Turlar", href: "/tur-rezervasyonu?type=daily" },
        { label: t.nav.cultureTours || "Konaklamalı Kültür Turları", href: "/tur-rezervasyonu?type=culture" },
    ];

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 backdrop-blur-md transition-shadow duration-300 ${scrolled
                    ? "bg-surface-white/95 shadow-[0_4px_24px_rgba(15,17,21,0.08)]"
                    : "bg-surface-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                }`}
        >
            <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-margin md:px-margin-tablet lg:px-margin-desktop">
                {/* Mobil hamburger */}
                <div className="flex flex-1 basis-0 lg:hidden">
                    <button
                        type="button"
                        aria-label={t.nav.openMenu}
                        onClick={onOpenMenu}
                        className="rounded-xl p-2 text-charcoal-dark transition-colors hover:bg-canvas-offwhite"
                    >
                        <Icon name="menu" className="text-[30px]" />
                    </button>
                </div>

                {/* Logo */}
                <div className="flex justify-center lg:flex-1 lg:justify-start">
                    <Link href="/" aria-label="Rentravel" className="flex items-center gap-2">
                        <SafeImage
                            src={IMG.logo}
                            alt="Rentravel Turizm Logo"
                            className="h-11 w-auto object-contain lg:h-8"
                        />
                    </Link>
                </div>

                {/* Masaüstü menü */}
                <nav aria-label="Ana menü" className="hidden items-center gap-1 lg:flex">
                    <NavLink href="/" active={isActive("/")}>
                        {t.nav.home}
                    </NavLink>

                    {/* Turlar dropdown */}
                    <div className="group relative">
                        <button
                            type="button"
                            aria-haspopup="true"
                            className={`group/nav relative inline-flex items-center gap-1 rounded-lg px-2 py-2 font-label-uppercase text-label-uppercase uppercase transition-colors duration-300 ${isActive("/tur-rezervasyonu")
                                    ? "text-primary-container"
                                    : "text-on-surface-variant"
                                }`}
                            onMouseEnter={(e) => { e.currentTarget.style.color = HOVER_RED; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = ""; }}
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                <span>{t.nav.tours}</span>
                                <Icon
                                    name="expand_more"
                                    className="text-[16px] transition-transform duration-300 group-hover:rotate-180"
                                />
                            </span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-crimson-vivid transition-transform duration-300 ease-out ${isActive("/tur-rezervasyonu")
                                        ? "scale-x-100"
                                        : "scale-x-0 group-hover/nav:scale-x-100"
                                    }`}
                                style={{ backgroundColor: "currentColor" }}
                            />
                        </button>
                        <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-[240px] translate-y-1 overflow-hidden rounded-xl bg-surface-white p-1 opacity-0 shadow-[0_8px_24px_rgba(15,17,21,0.14)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                            {tourLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="block rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-canvas-offwhite hover:text-crimson-vivid"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {navLinks.slice(1).map((l) => (
                        <NavLink key={l.href} href={l.href} active={isActive(l.href)}>
                            {l.label}
                        </NavLink>
                    ))}

                    {/* Kurumsal dropdown */}
                    <div className="group relative">
                        <button
                            type="button"
                            aria-haspopup="true"
                            className="group/nav relative inline-flex items-center gap-1 rounded-lg px-2 py-2 font-label-uppercase text-label-uppercase uppercase text-on-surface-variant transition-colors duration-300"
                            onMouseEnter={(e) => { e.currentTarget.style.color = HOVER_RED; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = ""; }}
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                <span>{t.nav.corporate}</span>
                                <Icon
                                    name="expand_more"
                                    className="text-[16px] transition-transform duration-300 group-hover:rotate-180"
                                />
                            </span>
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-crimson-vivid transition-transform duration-300 ease-out group-hover/nav:scale-x-100"
                                style={{ backgroundColor: "currentColor" }}
                            />
                        </button>
                        <div className="invisible absolute left-0 top-full z-50 mt-2 min-w-[200px] translate-y-1 overflow-hidden rounded-xl bg-surface-white p-1 opacity-0 shadow-[0_8px_24px_rgba(15,17,21,0.14)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                            {corporateLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className={`block rounded-lg px-3 py-2.5 font-label-md text-label-md transition-colors hover:bg-canvas-offwhite hover:text-crimson-vivid ${isActive(l.href) ? "text-primary-container" : "text-on-surface-variant"
                                        }`}
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </nav>

                {/* Sağ taraf */}
                <div className="flex flex-1 basis-0 items-center justify-end gap-3">
                    <LanguageMenu />
                    <Link
                        href="/vip-talep"
                        className="hidden items-center justify-center rounded-xl bg-primary-container px-4 py-2.5 font-label-uppercase text-label-uppercase tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid sm:inline-flex"
                    >
                        {t.nav.vipRequest}
                    </Link>
                </div>
            </div>
        </header>
    );
}