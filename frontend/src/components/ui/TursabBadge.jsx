"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SITE } from "@/lib/constants";
import Icon from "./Icon";

export default function TursabBadge() {
    const { t } = useLanguage();

    return (
        <a
            href={SITE.tursabUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`TÜRSAB Belge No ${SITE.tursabNo} — Doğrula`}
            className="group flex items-center gap-3 rounded-2xl bg-charcoal-surface px-4 py-3 transition-colors hover:bg-[#20242d]"
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal-dark text-crimson-vivid">
                <Icon name="verified" fill className="text-[22px]" />
            </span>

            <div className="flex min-w-0 flex-col">
                <span className="font-label-uppercase text-label-uppercase text-crimson-vivid">
                    {t.footer?.tursabEyebrow || "Resmi Doğrulama"}
                </span>
                <span className="truncate font-label-md text-label-md text-surface-white">
                    TÜRSAB — {SITE.tursabNo}
                </span>
            </div>

            <Icon
                name="open_in_new"
                className="ml-auto shrink-0 text-[16px] text-secondary-fixed-dim transition-colors group-hover:text-surface-white"
            />
        </a>
    );
}