"use client";

import Link from "@/components/ui/LocalizedLink";
import { IMG, SITE } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import Icon from "../ui/Icon";
import PaymentLogos from "../ui/PaymentLogos";
import SafeImage from "../ui/SafeImage";
import TursabBadge from "../ui/TursabBadge";

export default function Footer({ pages = [] }) {
    const { t, locale } = useLanguage();
    const year = new Date().getFullYear();

    const navLinks = [
        { label: t.nav.home, href: "/" },
        { label: t.nav.dailyTours, href: "/gunubirlik-turlar" },
        { label: t.nav.cultureTours, href: "/konaklamali-turlar" },
        { label: t.nav.cars, href: "/arac-kiralama" },
        { label: t.nav.bungalow, href: "/bungalov-konaklama" },
        { label: t.footer.vipConcierge, href: "/vip-talep" },
    ];

    const corporateLinks = [
        { label: t.nav.about, href: "/hakkimizda" },
        { label: t.nav.contact, href: "/iletisim" },
    ];

    return (
        <footer className="w-full bg-[#0D1017] pb-8 pt-12 text-surface-white md:pt-16">
            <div className="mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                {/* ÜST BLOK */}
                <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10 lg:grid-cols-12">
                    {/* Marka + TÜRSAB */}
                    <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-4">
                        <div className="flex items-center gap-2.5">
                            <SafeImage
                                src={IMG.logoMobile}
                                alt="Rentravel Turizm"
                                className="h-8 w-auto shrink-0 object-contain"
                            />
                            <span className="font-headline-sm text-headline-sm uppercase tracking-tight text-surface-white">
                                Rentravel Turizm
                            </span>
                        </div>

                        <p className="max-w-sm font-body-sm text-body-sm text-secondary-fixed-dim">{t.footer.desc}</p>

                        <TursabBadge />
                    </div>

                    {/* Hızlı erişim */}
                    <nav aria-label={t.footer.quickAccess} className="flex flex-col gap-3 lg:col-span-2">
                        <span className="font-label-uppercase text-label-uppercase uppercase text-crimson-vivid">
                            {t.footer.quickAccess}
                        </span>
                        <div className="flex flex-col gap-2">
                            {navLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="font-body-sm text-body-sm text-secondary-fixed-dim transition-colors hover:text-surface-white"
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
                                <Icon name="location_on" className="mt-0.5 shrink-0 text-[18px] text-crimson-vivid" />
                                <span className="min-w-0">{SITE.address}</span>
                            </div>
                            <a
                                href={SITE.phoneHref}
                                className="flex items-center gap-2 transition-colors hover:text-surface-white"
                            >
                                <Icon name="call" className="shrink-0 text-[18px] text-crimson-vivid" />
                                <span dir="ltr">{SITE.phone}</span>
                            </a>
                            {SITE.email && (
                                <a
                                    href={`mailto:${SITE.email}`}
                                    className="flex items-center gap-2 transition-colors hover:text-surface-white"
                                >
                                    <Icon name="mail" className="shrink-0 text-[18px] text-crimson-vivid" />
                                    <span dir="ltr" className="min-w-0 break-all">
                                        {SITE.email}
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Kurumsal */}
                    <nav aria-label={t.footer.corporate} className="flex flex-col gap-3 lg:col-span-3">
                        <span className="font-label-uppercase text-label-uppercase uppercase text-crimson-vivid">
                            {t.footer.corporate}
                        </span>
                        <div className="flex flex-col gap-2">
                            {corporateLinks.map((l) => (
                                <Link
                                    key={l.href}
                                    href={l.href}
                                    className="font-body-sm text-body-sm text-secondary-fixed-dim transition-colors hover:text-surface-white"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>

                {/* ÖDEME YÖNTEMLERİ */}
                <div className="mb-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-4 sm:flex-row sm:gap-4 sm:px-5">
                    <span className="text-center font-label-uppercase text-label-uppercase text-secondary-fixed-dim sm:text-start">
                        {t.footer.paymentMethods}
                    </span>
                    <PaymentLogos />
                </div>

                {/* ALT SATIR: yasal sayfalar panelden gelir */}
                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 font-label-sm text-label-sm text-secondary-fixed-dim sm:flex-row">
                    <p className="text-center sm:text-start">
                        © {year} Rentravel Turizm. {t.footer.rights}
                    </p>

                    {pages.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                            {pages.map((page) => (
                                <Link
                                    key={page.slug}
                                    href={`/${page.slug}`}
                                    className="transition-colors hover:text-surface-white"
                                >
                                    {localized(page.title, locale)}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
}