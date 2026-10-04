"use client";

import { TONES } from "@/lib/tones";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";
import { formatPrice } from "@/lib/format";
import { mediaAlt, mediaUrl } from "@/lib/media";
import Link from "@/components/ui/LocalizedLink";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

const DETAIL_PATH = { daily: "/gunubirlik-turlar", culture: "/konaklamali-turlar" };

export default function TourCard({ tour, variant = "daily", mode = "slider" }) {
    const { t, locale } = useLanguage();
    const isCulture = variant === "culture";

    const title = localized(tour.title, locale);
    const badge = localized(tour.badge, locale);
    const transport = localized(tour.transport, locale);
    const category = tour.category;

    const wrapperCls =
        mode === "grid"
            ? "w-full h-full" // grid içinde otomatik genişlik
            : "w-[300px] shrink-0 snap-start sm:w-[340px] lg:w-[360px]"; // slider modu

    return (
        <article
            className={`group flex ${wrapperCls} flex-col overflow-hidden rounded-2xl bg-surface-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
        >
            {/* Görsel */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-dark">
                <SafeImage
                    src={mediaUrl(tour.image, "md")}
                    alt={mediaAlt(tour.image, locale, title)}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {badge && (
                    <div
                        className={`absolute start-3 top-3 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase ${TONES[tour.badgeTone] ?? TONES.surface
                            }`}
                    >
                        {badge}
                    </div>
                )}
            </div>

            {/* İçerik */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                {/* Meta satırı */}
                <div className="flex items-center justify-between gap-3 font-label-sm text-label-sm text-secondary">
                    {tour.duration && (
                        <span className="flex items-center gap-1.5">
                            <Icon name="schedule" className="text-[16px] text-crimson-vivid" />
                            <span dir="ltr">{tour.duration}</span>
                        </span>
                    )}
                    {transport && (
                        <span className="flex items-center gap-1.5">
                            <Icon
                                name={tour.transportIcon || "location_on"}
                                className="text-[16px] text-crimson-vivid"
                            />
                            {transport}
                        </span>
                    )}
                </div>

                {/* Başlık + açıklama */}
                <div className="flex flex-col gap-2">
                    <h3 className="line-clamp-1 font-headline-sm text-headline-sm uppercase leading-tight text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                        {title}
                    </h3>
                    <p className="line-clamp-2 font-body-sm text-body-sm text-secondary">
                        {localized(tour.description, locale)}
                    </p>
                </div>

                {/* Kültür turlarında ek bilgi satırı: gece sayısı + kategori */}
                {isCulture && tour.nights > 0 && (
                    <div className="flex items-center gap-2 rounded-xl bg-canvas-offwhite px-3 py-2 font-label-sm text-label-sm text-secondary">
                        <Icon name="nights_stay" className="text-[16px] text-crimson-vivid" />
                        {tour.nights} {t.cards.nights}
                        {category && (
                            <span className="ms-auto flex items-center gap-1.5">
                                <Icon name={category.icon} className="text-[16px] text-crimson-vivid" />
                                {localized(category.label, locale)}
                            </span>
                        )}
                    </div>
                )}

                {/* Fiyat + CTA */}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-surface-variant/50 pt-3">
                    <div>
                        <div className="font-label-uppercase text-label-uppercase text-secondary">
                            {isCulture ? t.cards.startingFrom : t.cards.perPerson}
                        </div>
                        <div className="font-headline-md text-headline-md font-bold text-crimson-vivid">
                            {formatPrice(tour.defaultBasePrice, tour.currency, locale)}
                        </div>
                    </div>
                    <Link
                        href={`${DETAIL_PATH[variant]}/${tour.slug}`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-charcoal-dark px-3.5 py-2.5 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container"
                    >
                        <span>{t.cards.view}</span>
                        <Icon name="arrow_forward" className="text-[14px] rtl:-scale-x-100" />
                    </Link>
                </div>
            </div>
        </article>
    );
}