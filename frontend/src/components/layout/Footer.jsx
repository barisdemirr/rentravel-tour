"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SITE, IMG } from "@/lib/constants";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function Footer() {
    const { t } = useLanguage();
    const year = new Date().getFullYear();

    const navLinks = [
        { label: t.nav.home, href: "/" },
        { label: t.nav.tours, href: "/tur-rezervasyonu" },
        { label: t.nav.cars, href: "/arac-kiralama" },
        { label: t.nav.bungalow, href: "/bungalov-konaklama" },
        { label: t.footer.vipConcierge, href: "/vip-talep" },
    ];

    const corporateLinks = [
        { label: t.nav.about, href: "/hakkimizda" },
        { label: t.nav.contact, href: "/iletisim" },
    ];

    const legal = [
        { label: t.footer.legal.privacy, href: "/gizlilik-politikasi" },
        { label: t.footer.legal.terms, href: "/kullanim-kosullari" },
        { label: t.footer.legal.kvkk, href: "/kvkk" },
    ];

    return (
        <footer className="w-full bg-[#0D1017] pb-8 pt-16 text-surface-white">
            <div className="mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
                    {/* Marka + açıklama */}
                    <div className="flex flex-col gap-4 lg:col-span-4">
                        <div className="flex items-center gap-2">
                            <SafeImage
                                src={IMG.logo}
                                alt="Rentravel Turizm Logo"
                                className="h-8 w-auto object-contain"
                            />
                            <span className="font-headline-sm text-headline-sm uppercase tracking-tight text-surface-white">
                                Rentravel Turizm
                            </span>
                        </div>
                        <p className="max-w-sm font-body-sm text-body-sm text-secondary-fixed-dim">
                            {t.footer.desc}
                        </p>
                    </div>

                    {/* Hızlı erişim */}
                    <nav aria-label={t.footer.quickAccess} className="flex flex-col gap-3 lg:col-span-2">
                        <span className="font-label-uppercase text-label-uppercase uppercase text-crimson-vivid">
                            {t.footer.quickAccess}
                        </span>
                        <div className="flex flex-col gap-1.5">
                            {navLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="rounded-md font-body-sm text-body-sm text-secondary-fixed-dim transition-colors hover:text-surface-white"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Ofis */}
                    <div className="flex flex-col gap-3 lg:col-span-3">
                        <span className="font-label-uppercase text-label-uppercase uppercase text-crimson-vivid">
                            {t.footer.office}
                        </span>
                        <div className="flex flex-col gap-3 font-body-sm text-body-sm text-secondary-fixed-dim">
                            <div className="flex items-start gap-2">
                                <Icon name="location_on" className="mt-0.5 text-[18px] text-crimson-vivid" />
                                <span>{SITE.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="call" className="text-[18px] text-crimson-vivid" />
                                <a href={SITE.phoneHref} className="rounded-md transition-colors hover:text-surface-white">
                                    {SITE.phone}
                                </a>
                            </div>
                            {SITE.email && (
                                <div className="flex items-center gap-2">
                                    <Icon name="mail" className="text-[18px] text-crimson-vivid" />
                                    <a
                                        href={`mailto:${SITE.email}`}
                                        className="rounded-md transition-colors hover:text-surface-white"
                                    >
                                        {SITE.email}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Kurumsal */}
                    <nav aria-label={t.footer.corporate} className="flex flex-col gap-3 lg:col-span-3">
                        <span className="font-label-uppercase text-label-uppercase uppercase text-crimson-vivid">
                            {t.footer.corporate}
                        </span>
                        <div className="flex flex-col gap-1.5">
                            {corporateLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="rounded-md font-body-sm text-body-sm text-secondary-fixed-dim transition-colors hover:text-surface-white"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>

                {/* Alt satır */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 font-label-sm text-label-sm text-secondary-fixed-dim sm:flex-row">
                    <p>© {year} Rentravel Turizm. {t.footer.rights}</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {legal.map((l) => (
                            <Link key={l.href} href={l.href} className="rounded-md transition-colors hover:text-surface-white">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}