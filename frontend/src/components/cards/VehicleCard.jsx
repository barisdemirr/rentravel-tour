"use client";

import { TONES } from "@/lib/tones";
import { waHref, HOVER_RED } from "@/lib/constants";
import Icon from "../ui/Icon";
import SafeImage from "../ui/SafeImage";

export default function VehicleCard({ vehicle }) {
    const wa = waHref(
        `Merhaba, ${vehicle.name} aracı hakkında bilgi almak istiyorum.`
    );

    return (
        <article className="group flex h-full w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-surface-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl sm:w-[320px]">
            {/* Görsel */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-charcoal-dark">
                <SafeImage
                    src={vehicle.image}
                    alt={vehicle.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 font-label-uppercase text-label-uppercase ${TONES[vehicle.badgeTone]}`}
                >
                    {vehicle.badge}
                </div>
                <div className="absolute bottom-3 right-3 rounded-xl bg-charcoal-dark/90 px-3 py-1.5 font-body-md text-body-md font-bold text-surface-white backdrop-blur-sm">
                    {vehicle.pricePerDay}
                    <span className="ml-1 font-label-sm text-label-sm font-normal text-secondary-fixed-dim">
                        /gün
                    </span>
                </div>
            </div>

            {/* İçerik */}
            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex flex-col gap-1">
                    <span className="font-label-uppercase text-label-uppercase text-crimson-vivid">
                        {vehicle.category}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm uppercase text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                        {vehicle.name}
                    </h3>
                </div>

                {/* Özellikler */}
                <div className="grid grid-cols-2 gap-2 font-label-sm text-label-sm text-secondary">
                    <span className="flex items-center gap-1.5">
                        <Icon name="group" className="text-[16px] text-crimson-vivid" />
                        {vehicle.seats} Kişi
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon name="luggage" className="text-[16px] text-crimson-vivid" />
                        {vehicle.luggage} Bagaj
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon name="settings" className="text-[16px] text-crimson-vivid" />
                        {vehicle.transmission}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Icon name="local_gas_station" className="text-[16px] text-crimson-vivid" />
                        {vehicle.fuel}
                    </span>
                </div>

                {/* Etiketler */}
                <div className="flex flex-wrap gap-1.5">
                    {vehicle.features.slice(0, 3).map((f) => (
                        <span
                            key={f}
                            className="rounded-full bg-canvas-offwhite px-2.5 py-1 font-label-sm text-label-sm text-secondary"
                        >
                            {f}
                        </span>
                    ))}
                </div>

                {/* CTA */}
                <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal-dark px-4 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors group-hover:bg-primary-container"
                    style={{ "--hover": HOVER_RED }}
                >
                    <Icon name="chat" className="text-[16px]" />
                    Bilgi Al
                </a>
            </div>
        </article>
    );
}