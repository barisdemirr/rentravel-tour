"use client";

import { TONES } from "@/lib/tones";
import { waHref } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { formatPrice } from "@/lib/format";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { infoMessage } from "@/lib/whatsapp";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function VehicleCard({ vehicle }) {
    const { t, locale } = useLanguage();

    const name = localized(vehicle.name, locale);
    const badge = localized(vehicle.badge, locale);
    const segment = localized(vehicle.segment?.label, locale);
    const guarantee = localized(vehicle.guarantee, locale);

    const wa = waHref(infoMessage({ subject: `${localized(vehicle.name, "tr")} aracı`, locale }));

    return (
        <article className="group flex h-full w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-surface-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:w-[320px]">
            {/* Görsel */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal-dark">
                <SafeImage
                    src={mediaUrl(vehicle.image, "md")}
                    alt={mediaAlt(vehicle.image, locale, name)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {badge && (
                    <div
                        className={`absolute start-3 top-3 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase ${TONES[vehicle.badgeTone] ?? TONES.surface
                            }`}
                    >
                        {badge}
                    </div>
                )}
                <div className="absolute bottom-3 end-3 rounded-xl bg-charcoal-dark/90 px-3 py-1.5 font-body-md text-body-md font-bold text-surface-white backdrop-blur-sm">
                    {formatPrice(vehicle.defaultDailyPrice, vehicle.currency, locale)}
                    <span className="ms-1 font-label-sm text-label-sm font-normal text-secondary-fixed-dim">
                        /{t.cards.perDay}
                    </span>
                </div>
            </div>

            {/* İçerik */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex flex-col gap-1">
                    {segment && (
                        <span className="font-label-uppercase text-label-uppercase text-crimson-vivid">
                            {segment}
                        </span>
                    )}
                    <h3 className="font-headline-sm text-headline-sm uppercase text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                        {name}
                    </h3>
                </div>

                {/* Özellikler: aracın ilk 4 özelliği (vites, yakıt, kapasite, bagaj) */}
                <div className="grid grid-cols-2 gap-2 font-label-sm text-label-sm text-secondary">
                    {vehicle.specs.slice(0, 4).map((spec, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                            <Icon name={spec.icon} className="text-[16px] text-crimson-vivid" />
                            {localized(spec.value, locale)}
                        </span>
                    ))}
                </div>

                {/* Garanti etiketi */}
                {guarantee && (
                    <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm text-secondary">
                            {guarantee}
                        </span>
                    </div>
                )}

                {/* CTA */}
                <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-dark px-4 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container"
                >
                    <Icon name="chat" className="text-[16px]" />
                    {t.cards.requestInfo}
                </a>
            </div>
        </article>
    );
}