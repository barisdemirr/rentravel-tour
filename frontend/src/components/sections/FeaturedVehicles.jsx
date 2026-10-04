"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";
import AutoSlider from "../ui/AutoSlider";
import VehicleCard from "../cards/VehicleCard";

export default function FeaturedVehicles({ vehicles = [] }) {
    const { t } = useLanguage();

    if (vehicles.length === 0) return null;

    return (
        <section id="araclar" className="w-full bg-surface py-20">
            <div className="mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col gap-3">
                        <Eyebrow>{t.vehicles.eyebrow}</Eyebrow>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {t.vehicles.title}
                        </h2>
                        <p className="max-w-2xl font-body-md text-body-md text-secondary">{t.vehicles.subtitle}</p>
                    </div>
                </Reveal>

                <AutoSlider ariaLabel={t.vehicles.ariaLabel}>
                    {vehicles.map((vehicle) => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </AutoSlider>
            </div>
        </section>
    );
}