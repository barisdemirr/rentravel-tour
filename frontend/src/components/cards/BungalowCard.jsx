"use client";

import Link from "next/link";
import { TONES } from "@/lib/tones";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function BungalowCard({ bungalow }) {
    return (
        <article className="group flex h-full w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-surface-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:w-[340px] lg:w-[360px]">
            {/* Görsel */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal-dark">
                <SafeImage
                    src={bungalow.image}
                    alt={bungalow.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase ${TONES[bungalow.badgeTone]}`}
                >
                    {bungalow.badge}
                </div>
                {bungalow.rating && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-charcoal-dark/90 px-3 py-1.5 font-label-sm text-label-sm text-surface-white backdrop-blur-sm">
                        <Icon name="star" fill className="text-[14px] text-amber-400" />
                        <span className="font-bold">{bungalow.rating}</span>
                        {bungalow.reviews && (
                            <span className="text-secondary-fixed-dim">({bungalow.reviews})</span>
                        )}
                    </div>
                )}
            </div>

            {/* İçerik */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                {/* Konum */}
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
                    <Icon name="location_on" className="text-[16px] text-crimson-vivid" />
                    {bungalow.location}
                </div>

                {/* Başlık + açıklama */}
                <div className="flex flex-col gap-2">
                    <h3 className="font-headline-sm text-headline-sm uppercase leading-tight text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                        {bungalow.title}
                    </h3>
                    <p className="line-clamp-2 font-body-sm text-body-sm text-secondary">
                        {bungalow.description}
                    </p>
                </div>

                {/* Özellikler (kapasite, oda, banyo, alan) */}
                <div className="grid grid-cols-2 gap-2 font-label-sm text-label-sm text-secondary">
                    <span className="flex items-center gap-1.5">
                        <Icon name="group" className="text-[16px] text-crimson-vivid" />
                        {bungalow.capacity} Kişi
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon name="bed" className="text-[16px] text-crimson-vivid" />
                        {bungalow.bedrooms} Yatak Odası
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon name="bathtub" className="text-[16px] text-crimson-vivid" />
                        {bungalow.bathrooms} Banyo
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon name="square_foot" className="text-[16px] text-crimson-vivid" />
                        {bungalow.size} m²
                    </span>
                </div>

                {/* Etiketler */}
                <div className="flex flex-wrap gap-1.5">
                    {bungalow.amenities.slice(0, 3).map((a) => (
                        <span
                            key={a}
                            className="rounded-full bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm text-secondary"
                        >
                            {a}
                        </span>
                    ))}
                </div>

                {/* Fiyat + CTA */}
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div>
                        <div className="font-label-uppercase text-label-uppercase text-secondary">
                            Gecelik
                        </div>
                        <div className="font-headline-md text-headline-md font-bold text-crimson-vivid">
                            {bungalow.pricePerNight}
                        </div>
                    </div>
                    <Link
                        href={`/bungalov/${bungalow.slug}`}
                        className="inline-flex items-center justify-center rounded-xl bg-charcoal-dark px-4 py-2.5 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container"
                    >
                        Detaylar
                    </Link>
                </div>
            </div>
        </article>
    );
}