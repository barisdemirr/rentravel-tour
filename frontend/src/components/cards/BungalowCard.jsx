"use client";

import { TONES } from "@/lib/tones";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { formatPrice } from "@/lib/format";
import { mediaAlt, mediaUrl } from "@/lib/media";
import Link from "@/components/ui/LocalizedLink";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function BungalowCard({ bungalow }) {
    const { t, locale } = useLanguage();

    const title = localized(bungalow.title, locale);
    const region = localized(bungalow.region?.shortLabel, locale);
    const location = localized(bungalow.location, locale);
    const capacity = localized(bungalow.capacity, locale);

    return (
        <article className="group flex h-full w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-surface-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:w-[340px] lg:w-[360px]">
            {/* Görsel */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-dark">
                <SafeImage
                    src={mediaUrl(bungalow.image, "md")}
                    alt={mediaAlt(bungalow.image, locale, title)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {region && (
                    <div
                        className={`absolute start-3 top-3 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase ${TONES.dark}`}
                    >
                        {region}
                    </div>
                )}
            </div>

            {/* İçerik */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                {/* Konum */}
                {location && (
                    <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                        <Icon name="location_on" className="text-[16px] text-crimson-vivid" />
                        {location}
                    </div>
                )}

                {/* Başlık + açıklama */}
                <div className="flex flex-col gap-2">
                    <h3 className="font-headline-sm text-headline-sm uppercase leading-tight text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                        {title}
                    </h3>
                    <p className="line-clamp-2 font-body-sm text-body-sm text-secondary">
                        {localized(bungalow.description, locale)}
                    </p>
                </div>

                {/* Özellikler: kapasite ve kahvaltı */}
                <div className="grid grid-cols-2 gap-2 font-label-sm text-label-sm text-secondary">
                    {capacity && (
                        <span className="flex items-center gap-1.5">
                            <Icon name="group" className="text-[16px] text-crimson-vivid" />
                            {capacity}
                        </span>
                    )}
                    {bungalow.breakfastIncluded && (
                        <span className="flex items-center gap-1.5">
                            <Icon name="bakery_dining" className="text-[16px] text-crimson-vivid" />
                            {t.cards.breakfastIncluded}
                        </span>
                    )}
                </div>

                {/* Etiketler */}
                <div className="flex flex-wrap gap-1.5">
                    {bungalow.amenities.slice(0, 3).map((a, i) => (
                        <span
                            key={i}
                            className="rounded-full bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm text-secondary"
                        >
                            {localized(a.label, locale)}
                        </span>
                    ))}
                </div>

                {/* Fiyat + CTA */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div>
                        <div className="font-label-uppercase text-label-uppercase text-secondary">
                            {t.cards.perNight}
                        </div>
                        <div className="font-headline-md text-headline-md font-bold text-crimson-vivid">
                            {formatPrice(bungalow.defaultPricePerNight, bungalow.currency, locale)}
                        </div>
                    </div>
                    <Link
                        href={`/bungalov-konaklama/${bungalow.slug}`}
                        className="inline-flex items-center justify-center rounded-xl bg-charcoal-dark px-4 py-2.5 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container"
                    >
                        {t.cards.details}
                    </Link>
                </div>
            </div>
        </article>
    );
}