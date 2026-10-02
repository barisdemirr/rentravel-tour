"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { testimonials } from "@/lib/mockData";
import { TONES } from "@/lib/tones";
import Eyebrow from "../ui/Eyebrow";
import Reveal from "../ui/Reveal";
import Icon from "../ui/Icon";

export default function TestimonialsSection() {
    const { t } = useLanguage();
    const trackRef = useRef(null);

    const scrollByCard = (dir) => {
        const el = trackRef.current;
        if (!el || !el.firstElementChild) return;
        const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
        const step = el.firstElementChild.getBoundingClientRect().width + gap;
        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
        const atStart = el.scrollLeft <= 4;

        if (dir > 0 && atEnd) {
            el.scrollTo({ left: 0, behavior: "smooth" });
        } else if (dir < 0 && atStart) {
            el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
        } else {
            el.scrollBy({ left: dir * step, behavior: "smooth" });
        }
    };

    const btnCls =
        "flex h-10 w-10 items-center justify-center rounded-xl bg-charcoal-surface text-surface-white transition-colors hover:bg-crimson-vivid";

    return (
        <section className="w-full overflow-hidden bg-charcoal-dark py-20 text-surface-white">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-margin md:px-margin-tablet lg:px-margin-desktop">
                <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                    <div className="flex flex-col gap-3">
                        <Eyebrow>
                            {t.reviews?.eyebrow || "GOOGLE YORUMLARI"}
                        </Eyebrow>
                        <h2 className="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight text-surface-white md:font-headline-lg md:text-headline-lg">
                            {(t.reviews?.title1 || "Misafirlerimizin Kaleminden")}{" "}
                            <span className="text-crimson-vivid">
                                {t.reviews?.titleAccent || "Rentravel"}
                            </span>{" "}
                            {t.reviews?.title2 || "Deneyimi"}
                        </h2>
                        <p className="max-w-2xl font-body-md text-body-md text-secondary-fixed-dim">
                            {t.reviews?.subtitle ||
                                "Farklı ülkelerden misafirlerimizin Google'da bıraktığı gerçek yorumlar."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-start md:self-end">
                        <button
                            type="button"
                            aria-label="Önceki yorum"
                            onClick={() => scrollByCard(-1)}
                            className={btnCls}
                        >
                            <Icon name="chevron_left" className="text-[20px]" />
                        </button>
                        <button
                            type="button"
                            aria-label="Sonraki yorum"
                            onClick={() => scrollByCard(1)}
                            className={btnCls}
                        >
                            <Icon name="chevron_right" className="text-[20px]" />
                        </button>
                    </div>
                </Reveal>

                <Reveal>
                    <div
                        ref={trackRef}
                        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth"
                    >
                        {testimonials.map((r, i) => (
                            <figure
                                key={r.id}
                                className="flex w-[88%] flex-shrink-0 snap-start flex-col justify-between gap-6 rounded-2xl bg-charcoal-surface p-6 shadow-sm md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                            >
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex text-amber-400" role="img" aria-label="5/5">
                                            {[0, 1, 2, 3, 4].map((n) => (
                                                <Icon
                                                    key={n}
                                                    name="star"
                                                    fill
                                                    className="text-[18px]"
                                                />
                                            ))}
                                        </div>
                                        <span className="rounded-full bg-charcoal-dark px-2.5 py-1 font-label-uppercase text-label-uppercase text-crimson-vivid">
                                            {r.lang}
                                        </span>
                                    </div>
                                    <blockquote
                                        dir={r.dir}
                                        lang={r.lang.toLowerCase()}
                                        className="font-body-md text-body-md italic leading-relaxed text-surface-variant"
                                    >
                                        "{r.text}"
                                    </blockquote>
                                </div>

                                <figcaption className="flex items-center gap-3 pt-2">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl font-headline-sm text-headline-sm font-bold ${i % 2 === 0 ? TONES.primary : TONES.dark
                                            }`}
                                    >
                                        {r.initials}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-label-md text-label-md text-surface-white">
                                            {r.name}
                                        </span>
                                        <span className="font-label-sm text-label-sm text-secondary-fixed-dim">
                                            {t.reviews?.googleReview || "Google Yorumu"}
                                        </span>
                                    </div>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}