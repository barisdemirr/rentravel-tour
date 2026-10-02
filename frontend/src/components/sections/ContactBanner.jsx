"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SITE, waHref } from "@/lib/constants";
import Icon from "../ui/Icon";
import Reveal from "../ui/Reveal";

export default function ContactBanner() {
    const { t } = useLanguage();
    const wa = waHref();

    return (
        <section className="relative w-full overflow-hidden bg-primary-container py-20 text-on-primary">
            <div className="relative z-10 mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
                    <Reveal className="flex flex-col gap-4 lg:col-span-8">
                        <span className="self-start rounded-full bg-charcoal-dark/30 px-4 py-1.5 font-label-uppercase text-label-uppercase uppercase tracking-widest text-surface-white">
                            {t.contact?.eyebrow || "VIP CONCİERGE & KURUMSAL SEYAHAT"}
                        </span>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase leading-tight tracking-tight text-surface-white md:font-headline-lg md:text-headline-lg">
                            {t.contact?.title || "Kişiye ve Gruba Özel Rota mı Planlıyorsunuz?"}
                        </h2>
                        <p className="max-w-2xl font-body-lg text-body-lg text-surface-white/90">
                            {t.contact?.subtitle ||
                                "Bölgeyi çok iyi bilen seyahat danışmanlarımızla size ve ailenize özel rotayı birlikte planlayalım."}
                        </p>
                        <ul className="flex flex-wrap items-center gap-6 pt-2 font-label-md text-label-md text-surface-white">
                            {(t.contact?.features || [
                                "Şoförlü Özel Araç",
                                "TÜRSAB Belgeli Acente",
                                "Kişiye Özel Esnek Saatler",
                            ]).map((f) => (
                                <li key={f} className="flex items-center gap-2">
                                    <Icon name="check_circle" className="text-[20px]" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                    </Reveal>

                    <Reveal
                        delay={0.12}
                        className="flex flex-col gap-4 rounded-2xl bg-charcoal-dark p-6 text-surface-white shadow-2xl lg:col-span-4"
                    >
                        <div className="flex flex-col gap-2">
                            <span className="font-label-uppercase text-label-uppercase uppercase text-crimson-vivid">
                                {t.contact?.callLabel || "Hemen İletişime Geçin"}
                            </span>
                            <a
                                href={SITE.phoneHref}
                                className="flex items-center gap-2 font-headline-md text-headline-md text-surface-white transition-colors hover:text-crimson-vivid"
                            >
                                <Icon name="call" className="text-crimson-vivid" />
                                <span>{SITE.phone}</span>
                            </a>
                            {SITE.hours && (
                                <span className="font-label-sm text-label-sm text-secondary-fixed-dim">
                                    {SITE.hours}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            {wa && (
                                <a
                                    href={wa}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-crimson-vivid py-3.5 font-label-uppercase text-label-uppercase tracking-wider text-surface-white shadow-md transition-colors hover:bg-[#ff1e38]"
                                >
                                    <Icon name="chat" className="text-[18px]" />
                                    <span>{t.contact?.whatsapp || "WhatsApp VIP Canlı Destek"}</span>
                                </a>
                            )}
                            <Link
                                href="/vip-talep"
                                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-label-uppercase text-label-uppercase tracking-wider transition-colors ${wa
                                    ? "bg-charcoal-surface text-surface-white hover:bg-surface-white hover:text-charcoal-dark"
                                    : "bg-crimson-vivid text-surface-white shadow-md hover:bg-[#ff1e38]"
                                    }`}
                            >
                                <span>{t.contact?.formBtn || "Özel Talep Formu Doldur"}</span>
                                <Icon name="arrow_forward" className="text-[16px]" />
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}