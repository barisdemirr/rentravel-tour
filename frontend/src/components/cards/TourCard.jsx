"use client";

import Link from "next/link";
import { TONES } from "@/lib/tones";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function TourCard({ tour, variant = "daily", mode = "slider" }) {
    const isCulture = variant === "culture";

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
                    src={tour.image}
                    alt={tour.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase ${TONES[tour.badgeTone]}`}
                >
                    {tour.badge}
                </div>
                {tour.rating && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-charcoal-dark/90 px-3 py-1.5 font-label-sm text-label-sm text-surface-white backdrop-blur-sm">
                        <Icon name="star" fill className="text-[14px] text-amber-400" />
                        <span className="font-bold">{tour.rating}</span>
                        {tour.reviews && (
                            <span className="text-secondary-fixed-dim">({tour.reviews})</span>
                        )}
                    </div>
                )}
            </div>

            {/* İçerik */}
            <div className="flex flex-1 flex-col gap-3 p-5">
                {/* Meta satırı */}
                <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary">
                    <span className="flex items-center gap-1.5">
                        <Icon name="schedule" className="text-[16px] text-crimson-vivid" />
                        {tour.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon
                            name={tour.transportIcon}
                            className="text-[16px] text-crimson-vivid"
                        />
                        {tour.transport}
                    </span>
                </div>

                {/* Başlık + açıklama */}
                <div className="flex flex-col gap-2">
                    <h3 className="font-headline-sm text-headline-sm uppercase leading-tight text-charcoal-dark transition-colors group-hover:text-crimson-vivid line-clamp-1">
                        {tour.title}
                    </h3>
                    <p className="line-clamp-2 font-body-sm text-body-sm text-secondary">
                        {tour.description}
                    </p>
                </div>

                {/* Kültür turlarında ek bilgi satırı */}
                {isCulture && tour.nights && (
                    <div className="flex items-center gap-2 rounded-xl bg-canvas-offwhite px-3 py-2 font-label-sm text-label-sm text-secondary">
                        <Icon name="nights_stay" className="text-[16px] text-crimson-vivid" />
                        {tour.nights}
                        <span className="ml-auto flex items-center gap-1.5">
                            <Icon name="hotel" className="text-[16px] text-crimson-vivid" />
                            {tour.accommodation}
                        </span>
                    </div>
                )}

                {/* Fiyat + CTA */}
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-surface-variant/50 pt-3">
                    <div>
                        <div className="font-label-uppercase text-label-uppercase text-secondary">
                            Kişi Başı
                        </div>
                        <div className="font-headline-md text-headline-md font-bold text-crimson-vivid">
                            {tour.price}
                        </div>
                    </div>
                    <Link
                        href={`/turlar/${tour.slug}`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-charcoal-dark px-3.5 py-2.5 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container"
                    >
                        <span>İncele</span>
                        <Icon name="arrow_forward" className="text-[14px]" />
                    </Link>
                </div>
            </div>
        </article>
    );
}