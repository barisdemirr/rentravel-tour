"use client";

import { SITE } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Icon from "./Icon";

/** Güven rozeti: belge numarası ve TÜRSAB doğrulama bağlantısı */
export default function TursabBadge() {
    const { t, tpl } = useLanguage();
    const f = t.footer;

    return (
        <a
            href="https://www.tursab.org.tr/tr/ddsv"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3.5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 transition-colors hover:border-crimson-vivid/40 hover:bg-white/[0.07] sm:p-4"
        >
            {/* Mühür */}
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-vivid to-[#8f0019] shadow-[0_6px_18px_-6px_rgba(217,4,41,0.7)] sm:h-16 sm:w-16">
                <Icon name="verified_user" fill className="text-[28px] text-white sm:text-[32px]" />
            </span>

            <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-headline-sm text-headline-sm font-bold leading-tight text-surface-white">
                    {f.tursabTitle}
                </span>
                <span dir="ltr" className="font-label-md text-label-md font-semibold text-crimson-vivid">
                    {tpl(f.tursabNo, { no: SITE.tursabNo })}
                </span>
                <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary-fixed-dim">
                    {f.tursabNote}
                    <Icon
                        name="arrow_outward"
                        className="text-[13px] opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100"
                    />
                </span>
            </span>
        </a>
    );
}