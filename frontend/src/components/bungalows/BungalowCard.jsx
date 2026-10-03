"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SafeImage from "@/components/ui/SafeImage";

export default function BungalowCard({ bungalow }) {
    const isBreakfast = bungalow.breakfastIncluded;

    return (
        <article className="group flex h-full flex-col justify-between rounded-3xl border border-surface-variant/70 bg-surface-white p-3.5 shadow-[0_4px_24px_-4px_rgba(15,17,21,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(217,4,41,0.18)]">
            <div>
                {/* GÖRSEL */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-2xl bg-canvas-offwhite">
                    <SafeImage
                        src={bungalow.image}
                        alt={bungalow.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Kahvaltı rozeti (sol üst) */}
                    <div className="absolute left-3 top-3">
                        {isBreakfast ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-white shadow-lg">
                                <Icon name="free_breakfast" className="text-[12px]" />
                                Kahvaltı Dahil
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal-dark/80 px-3 py-1 font-label-uppercase text-label-uppercase font-bold text-white shadow-lg backdrop-blur-md">
                                <Icon name="home" className="text-[12px]" />
                                Sadece Konaklama
                            </span>
                        )}
                    </div>

                    {/* Konum (sol alt) */}
                    <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-black/60 px-3 py-1 font-label-md text-label-md text-white backdrop-blur-md">
                        <Icon name="location_on" className="shrink-0 text-[13px] text-crimson-vivid" />
                        <span className="truncate">{bungalow.location}</span>
                    </div>

                    {/* Rating (sağ alt) */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-surface-white/95 px-2.5 py-1 font-label-md text-label-md shadow-md backdrop-blur-md">
                        <Icon name="star" fill className="text-[12px] text-amber-500" />
                        <span className="font-bold text-charcoal-dark">{bungalow.rating}</span>
                        <span className="text-secondary">({bungalow.reviews})</span>
                    </div>
                </div>

                {/* BAŞLIK + AÇIKLAMA */}
                <div className="px-1.5 pt-4">
                    <h3 className="font-headline-sm text-headline-sm font-bold leading-snug text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                        {bungalow.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 font-body-sm text-body-sm leading-relaxed text-secondary">
                        {bungalow.description}
                    </p>

                    {/* AMENITY PILL'LERİ */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-1 rounded-xl bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm font-medium text-charcoal-dark">
                            <Icon name="group" className="text-[14px] text-secondary" />
                            {bungalow.capacity}
                        </span>
                        {bungalow.amenities.slice(0, 3).map((a) => (
                            <span
                                key={a.label}
                                className="flex items-center gap-1 rounded-xl bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm font-medium text-charcoal-dark"
                            >
                                <Icon name={a.icon} className="text-[14px] text-secondary" />
                                {a.label}
                            </span>
                        ))}
                    </div>

                    {/* KAHVALTI SATIRI */}
                    <div
                        className={`mt-3.5 flex items-start gap-2 rounded-2xl border px-3 py-2 font-label-md text-label-md font-semibold ${isBreakfast
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-surface-variant bg-canvas-offwhite text-secondary"
                            }`}
                    >
                        <Icon
                            name={isBreakfast ? "verified" : "info"}
                            className={`mt-0.5 shrink-0 text-[16px] ${isBreakfast ? "text-emerald-600" : "text-secondary"
                                }`}
                        />
                        <span className="text-[11px] leading-snug">{bungalow.breakfastNote}</span>
                    </div>
                </div>
            </div>

            {/* FİYAT + CTA */}
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-surface-variant/60 px-1.5 pt-4">
                <div>
                    <span className="block font-label-uppercase text-label-uppercase font-bold tracking-wider text-secondary">
                        Gecelik Fiyat
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="font-headline-md text-headline-md font-extrabold text-crimson-vivid">
                            {bungalow.pricePerNight}
                        </span>
                        <span className="font-body-sm text-body-sm font-medium text-secondary">
                            / gece
                        </span>
                    </div>
                    <span className="mt-0.5 block font-body-sm text-body-sm text-secondary">
                        Temizlik & KDV Dahildir
                    </span>
                </div>

                <Link
                    href={`/bungalov/${bungalow.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary-container px-4 py-2.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-[0_4px_14px_rgba(217,4,41,0.3)] transition-all hover:bg-crimson-vivid hover:scale-105 active:scale-95"
                >
                    <span>Evi İncele</span>
                    <Icon name="arrow_forward" className="text-[14px]" />
                </Link>
            </div>
        </article>
    );
}