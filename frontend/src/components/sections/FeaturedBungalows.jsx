"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";
import AutoSlider from "../ui/AutoSlider";
import BungalowCard from "../cards/BungalowCard";

export default function FeaturedBungalows({ bungalows = [] }) {
    const { t } = useLanguage();

    if (bungalows.length === 0) return null;

    return (
        <section id="bungalovlar" className="w-full bg-canvas-offwhite py-20">
            <div className="mx-auto max-w-[1440px] px-margin md:px-margin-tablet lg:px-margin-desktop">
                <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col gap-3">
                        <Eyebrow>{t.bungalows.eyebrow}</Eyebrow>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {t.bungalows.title}
                        </h2>
                        <p className="max-w-2xl font-body-md text-body-md text-secondary">{t.bungalows.subtitle}</p>
                    </div>
                </Reveal>

                <AutoSlider ariaLabel={t.bungalows.ariaLabel}>
                    {bungalows.map((bungalow) => (
                        <BungalowCard key={bungalow.id} bungalow={bungalow} />
                    ))}
                </AutoSlider>
            </div>
        </section>
    );
}