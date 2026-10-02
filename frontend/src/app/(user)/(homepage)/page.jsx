"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cultureTours } from "@/lib/mockData";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import AutoSlider from "@/components/ui/AutoSlider";
import TourCard from "@/components/cards/TourCard";

export default function CultureTours() {
    const { t } = useLanguage();

    return (
        <section id="kultur-turlari" className="w-full bg-surface py-20">
            <div className="mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col gap-3">
                        <Eyebrow>{t.cultureTours?.eyebrow || "KONAKLAMALI KÜLTÜR"}</Eyebrow>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {t.cultureTours?.title || "Konaklamalı Kültür Turları"}
                        </h2>
                        <p className="max-w-2xl font-body-md text-body-md text-secondary">
                            {t.cultureTours?.subtitle ||
                                "Otel konaklaması dahil, tarih ve kültür dolu çok günlü özel programlar."}
                        </p>
                    </div>
                </Reveal>

                <AutoSlider ariaLabel="Konaklamalı kültür turları">
                    {cultureTours.map((tour) => (
                        <TourCard key={tour.id} tour={tour} variant="culture" />
                    ))}
                </AutoSlider>
            </div>
        </section>
    );
}