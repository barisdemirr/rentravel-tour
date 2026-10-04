"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";
import AutoSlider from "../ui/AutoSlider";
import TourCard from "../cards/TourCard";

export default function CultureTours({ tours = [] }) {
    const { t } = useLanguage();

    if (tours.length === 0) return null;

    return (
        <section id="kultur-turlari" className="w-full bg-surface py-20">
            <div className="mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col gap-3">
                        <Eyebrow>{t.cultureTours.eyebrow}</Eyebrow>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {t.cultureTours.title}
                        </h2>
                        <p className="max-w-2xl font-body-md text-body-md text-secondary">{t.cultureTours.subtitle}</p>
                    </div>
                </Reveal>

                <AutoSlider ariaLabel={t.cultureTours.ariaLabel}>
                    {tours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} variant="culture" />
                    ))}
                </AutoSlider>
            </div>
        </section>
    );
}