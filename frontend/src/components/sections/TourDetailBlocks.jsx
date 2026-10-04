"use client";

import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localized } from "@/lib/i18n/localized";

export function Card({ children, className = "bg-surface-white shadow-sm" }) {
    return <div className={`flex flex-col gap-4 rounded-3xl p-4 sm:p-6 md:p-8 ${className}`}>{children}</div>;
}

export function SectionTitle({ eyebrow, title }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-crimson-vivid">
                {eyebrow}
            </span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark md:font-headline-md md:text-headline-md">
                {title}
            </h3>
        </div>
    );
}

export function GuestCounter({ label, sub, count, onDec, onInc, decLabel, incLabel }) {
    const btn =
        "flex h-10 w-10 items-center justify-center rounded-full bg-surface-white text-[20px] font-bold text-charcoal-dark shadow-sm transition-all hover:bg-crimson-vivid hover:text-white active:scale-90";

    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-canvas-offwhite p-3">
            <div className="min-w-0">
                <span className="block font-label-md text-label-md font-bold text-charcoal-dark">{label}</span>
                <span className="block font-body-sm text-body-sm text-secondary">{sub}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={onDec} aria-label={decLabel} className={btn}>
                    −
                </button>
                <span className="w-7 text-center font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {count}
                </span>
                <button type="button" onClick={onInc} aria-label={incLabel} className={btn}>
                    +
                </button>
            </div>
        </div>
    );
}

export function QuickSpecs({ specs = [] }) {
    const { locale } = useLanguage();
    if (specs.length === 0) return null;

    return (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-surface-white p-3 shadow-sm sm:gap-3 sm:p-4 md:grid-cols-5">
            {specs.map((s, i) => {
                const emerald = s.tone === "emerald";
                return (
                    <div key={i} className="flex min-w-0 items-center gap-2.5 rounded-xl p-1.5 sm:p-2">
                        <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${emerald
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-crimson-vivid/10 text-crimson-vivid"
                                }`}
                        >
                            <Icon name={s.icon} className="text-[20px] sm:text-[22px]" />
                        </span>
                        <div className="min-w-0">
                            <span className="block truncate font-label-uppercase text-label-uppercase text-secondary">
                                {localized(s.label, locale)}
                            </span>
                            <span
                                className={`block truncate font-label-md text-label-md font-bold sm:font-headline-sm sm:text-headline-sm ${emerald ? "text-emerald-600" : "text-charcoal-dark"
                                    }`}
                            >
                                {localized(s.sub, locale)}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export function Editorial({ editorial }) {
    const { locale } = useLanguage();
    const eyebrow = localized(editorial.eyebrow, locale);
    const paragraphs = (editorial.paragraphs ?? []).map((p) => localized(p, locale)).filter(Boolean);
    const highlights = (editorial.highlights ?? []).map((h) => localized(h, locale)).filter(Boolean);

    return (
        <Card>
            {eyebrow && (
                <div className="flex items-center gap-2 font-label-uppercase text-label-uppercase font-bold text-crimson-vivid">
                    {editorial.eyebrowIcon && <Icon name={editorial.eyebrowIcon} className="text-[18px]" />}
                    <span>{eyebrow}</span>
                </div>
            )}

            <h2 className="font-headline-sm text-headline-sm font-bold tracking-tight text-charcoal-dark md:font-headline-md md:text-headline-md">
                {localized(editorial.title, locale)}
            </h2>

            <div className="flex flex-col gap-3">
                {paragraphs.map((p, i) => (
                    <p key={i} className="font-body-md text-body-md leading-relaxed text-secondary">
                        {p}
                    </p>
                ))}
            </div>

            {highlights.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {highlights.map((h, i) => (
                        <span
                            key={i}
                            className="inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1.5 font-label-md text-label-md text-charcoal-dark"
                        >
                            <Icon name="verified" className="text-[14px] text-crimson-vivid" />
                            {h}
                        </span>
                    ))}
                </div>
            )}
        </Card>
    );
}

export function Itinerary({ items, eyebrow, title }) {
    const { locale } = useLanguage();

    return (
        <Card>
            <SectionTitle eyebrow={eyebrow} title={title} />

            <ol className="relative space-y-3 ps-8 before:absolute before:bottom-3 before:start-[14px] before:top-3 before:w-0.5 before:bg-canvas-offwhite sm:space-y-4">
                {items.map((item, i) => (
                    <li key={i} className="relative">
                        <span
                            className={`absolute -start-8 top-1 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md ${item.isFinal ? "bg-emerald-600" : "bg-crimson-vivid"
                                }`}
                        >
                            <Icon name={item.icon} className="text-[14px]" />
                        </span>

                        <div className="rounded-2xl bg-canvas-offwhite p-3.5 sm:p-4">
                            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                <span className="min-w-0 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                    {localized(item.title, locale)}
                                </span>
                                <span
                                    dir="ltr"
                                    className={`rounded-full bg-surface-white px-3 py-0.5 font-label-md text-label-md font-bold shadow-sm ${item.isFinal ? "text-emerald-600" : "text-crimson-vivid"
                                        }`}
                                >
                                    {item.time}
                                </span>
                            </div>
                            {item.description && (
                                <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                                    {localized(item.description, locale)}
                                </p>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </Card>
    );
}

export function Inclusions({ inclusions }) {
    const { t, locale } = useLanguage();
    const d = t.tourDetail;
    const included = inclusions.included ?? [];
    const excluded = inclusions.excluded ?? [];
    if (included.length === 0 && excluded.length === 0) return null;

    return (
        <Card>
            <SectionTitle eyebrow={d.inclusionEyebrow} title={d.inclusionTitle} />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
                {included.length > 0 && (
                    <div className="rounded-2xl bg-emerald-500/5 p-4 sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                                <Icon name="check" className="text-[16px]" />
                            </span>
                            <span className="font-headline-sm text-headline-sm font-bold text-emerald-700">
                                {d.included}
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                            {included.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 px-1 py-1 font-body-sm text-body-sm text-charcoal-dark"
                                >
                                    <Icon
                                        name="check_circle"
                                        fill
                                        className="mt-0.5 shrink-0 text-[18px] text-emerald-600"
                                    />
                                    <span>{localized(item.text, locale)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {excluded.length > 0 && (
                    <div className="rounded-2xl bg-crimson-vivid/5 p-4 sm:p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crimson-vivid text-white">
                                <Icon name="close" className="text-[16px]" />
                            </span>
                            <span className="font-headline-sm text-headline-sm font-bold text-crimson-vivid">
                                {d.excluded}
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1.5">
                            {excluded.map((item, i) => (
                                <li
                                    key={i}
                                    className="flex items-start gap-2 px-1 py-1 font-body-sm text-body-sm text-charcoal-dark"
                                >
                                    <Icon name="cancel" className="mt-0.5 shrink-0 text-[18px] text-crimson-vivid" />
                                    <span>{localized(item.text, locale)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </Card>
    );
}

export function TravelNotes({ notes }) {
    const { t, locale } = useLanguage();

    return (
        <Card className="bg-canvas-offwhite">
            <div className="flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                <Icon name="lightbulb" className="shrink-0 text-[22px] text-crimson-vivid" />
                <span>{t.tourDetail.notesTitle}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {notes.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-2xl bg-surface-white p-3.5 sm:p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crimson-vivid/10">
                            <Icon name={n.icon || "info"} className="text-[20px] text-crimson-vivid" />
                        </span>
                        <span className="min-w-0 font-body-sm text-body-sm leading-relaxed text-secondary">
                            {localized(n.text, locale)}
                        </span>
                    </div>
                ))}
            </div>
        </Card>
    );
}