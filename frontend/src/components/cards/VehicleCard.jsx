"use client";

import Link from "@/components/ui/LocalizedLink";
import { TONES } from "@/lib/tones";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { formatPrice } from "@/lib/format";
import { mediaAlt, mediaUrl } from "@/lib/media";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function VehicleCard({ vehicle }) {
    const { t, locale } = useLanguage();

    const name = localized(vehicle.name, locale);
    const badge = localized(vehicle.badge, locale);
    const segment = localized(vehicle.segment?.label, locale);
    const guarantee = localized(vehicle.guarantee, locale);

    const specs = (vehicle.specs ?? []).slice(0, 4);

    return (
        <article className="h-full w-[280px] shrink-0 snap-start sm:w-[320px]">
            {/* Kartın tamamı tek bağlantı: her yerine tıklanabilir */}
            <Link
                href={`/arac-kiralama/${vehicle.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-surface-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
                {/* Görsel */}
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-charcoal-dark">
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
                    {/* Segment satırı her zaman yer kaplar, boşsa görünmez */}
                    <div className="flex flex-col gap-1">
                        <span className="min-h-[1.2em] font-label-uppercase text-label-uppercase text-crimson-vivid">
                            {segment || "\u00A0"}
                        </span>
                        {/* İki satırlık sabit alan: tek satırlık başlıklar da aynı yüksekliği kaplar */}
                        <h3 className="line-clamp-2 min-h-[2.6em] font-headline-sm text-headline-sm uppercase leading-[1.3] text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                            {name}
                        </h3>
                    </div>

                    {/* Özellikler: her zaman iki satırlık ızgara (dörtten az olsa da) */}
                    <div className="grid min-h-[3.4em] grid-cols-2 content-start gap-2 font-label-sm text-label-sm text-secondary">
                        {specs.map((spec, i) => (
                            <span key={i} className="flex min-w-0 items-center gap-1.5">
                                <Icon name={spec.icon} className="shrink-0 text-[16px] text-crimson-vivid" />
                                <span className="truncate">{localized(spec.value, locale)}</span>
                            </span>
                        ))}
                    </div>

                    {/* Garanti etiketi: yoksa da yeri korunur */}
                    <div className="min-h-[2em]">
                        {guarantee && (
                            <span className="inline-block max-w-full truncate rounded-full bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm text-secondary">
                                {guarantee}
                            </span>
                        )}
                    </div>

                    {/* CTA: kartın kendisi bağlantı, bu sadece görsel ipucu */}
                    <span className="mt-auto inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-charcoal-dark px-4 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container">
                        {t.cards.details}
                        <Icon name="arrow_forward" className="text-[16px] rtl:-scale-x-100" />
                    </span>
                </div>
            </Link>
        </article>
    );
}