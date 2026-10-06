import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Link from "@/components/ui/LocalizedLink";
import { SITE, waHref } from "@/lib/constants";
import { interpolate } from "@/lib/i18n/dictionaries";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale } from "@/lib/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import { infoMessage } from "@/lib/whatsapp";

const PATH = "/hakkimizda";

/* Hizmet listesi sözlükteki sırayla eşleşir */
const SERVICE_ICONS = [
    "travel_explore",
    "account_balance",
    "car_rental",
    "airport_shuttle",
    "flight_land",
    "hotel",
    "favorite",
    "groups",
    "flight",
];

const APPROACH_ICONS = ["public", "route", "forum"];
const VALUE_ICONS = ["verified_user", "visibility", "sentiment_satisfied"];

const localePath = (lang, path) => (lang === "tr" ? path : `/${lang}${path}`);

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const a = getDictionary(lang).about;
    const description = interpolate(a.metaDescription, { tursabNo: SITE.tursabNo });

    return {
        title: a.metaTitle,
        description,
        alternates: buildAlternates(PATH, lang),
        // openGraph üst katmandakini tamamen ezer, bu yüzden eksiksiz verilir
        openGraph: {
            title: `${a.metaTitle} | Rentravel Turizm`,
            description,
            url: `${SITE_URL}${localePath(lang, PATH)}`,
            siteName: "Rentravel Turizm",
            images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rentravel Turizm" }],
            type: "website",
        },
    };
}

export default async function AboutPage({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();

    const a = getDictionary(lang).about;
    const vars = { tursabNo: SITE.tursabNo };
    const whatsapp = waHref(infoMessage({ locale: lang }));

    const stats = [
        { icon: "workspace_premium", value: SITE.tursabNo, label: a.stats.tursab, ltr: true },
        { icon: "verified", value: a.stats.group, label: a.stats.groupLabel },
        { icon: "location_on", value: a.stats.base, label: a.stats.baseLabel },
        { icon: "category", value: a.stats.services, label: a.stats.servicesLabel },
    ];

    /* Breadcrumb yapısal verisi: Google arama sonucunda yol gösterir */
    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: a.home, item: `${SITE_URL}${localePath(lang, "/") || "/"}` },
            { "@type": "ListItem", position: 2, name: a.metaTitle, item: `${SITE_URL}${localePath(lang, PATH)}` },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

            {/* ─────────── HERO ─────────── */}
            <section className="relative overflow-hidden bg-charcoal-dark pb-28 pt-10 md:pb-36 md:pt-14">
                {/* Dekor: kırmızı ışık lekeleri ve ince ızgara */}
                <div className="pointer-events-none absolute -end-32 -top-32 h-96 w-96 rounded-full bg-primary-container/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 -start-24 h-96 w-96 rounded-full bg-crimson-vivid/15 blur-3xl" />
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
                    <nav aria-label={a.breadcrumbLabel} className="mb-8">
                        <ol className="flex items-center gap-1.5 font-label-md text-label-md text-white/60">
                            <li>
                                <Link href="/" className="transition-colors hover:text-white">
                                    {a.home}
                                </Link>
                            </li>
                            <li aria-hidden="true">
                                <Icon name="chevron_right" className="text-[16px] rtl:-scale-x-100" />
                            </li>
                            <li aria-current="page" className="text-white">
                                {a.metaTitle}
                            </li>
                        </ol>
                    </nav>

                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-crimson-vivid" />
                            <span className="font-label-uppercase text-label-uppercase text-white">{a.eyebrow}</span>
                        </div>

                        <h1 className="text-balance font-display-hero-mobile text-display-hero-mobile font-extrabold text-white md:font-display-hero md:text-display-hero">
                            {a.heroTitle}{" "}
                            <span className="bg-gradient-to-r from-crimson-vivid to-[#ff6b7d] bg-clip-text text-transparent">
                                {a.heroAccent}
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl font-body-md text-body-md text-white/75 md:font-body-lg md:text-body-lg">
                            {a.heroText}
                        </p>
                    </div>
                </div>
            </section>

            {/* ─────────── KÜNYE KARTI ─────────── */}
            <section className="relative z-20 mx-auto -mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-10">
                <div className="grid grid-cols-2 overflow-hidden rounded-3xl bg-surface-white shadow-[0_20px_40px_-15px_rgba(15,17,21,0.12)] lg:grid-cols-4">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={`flex items-center gap-3 p-5 sm:p-6 ${i % 2 === 0 ? "border-e border-surface-variant" : ""} ${i < 2 ? "border-b border-surface-variant lg:border-b-0" : ""
                                } ${i === 1 ? "lg:border-e" : ""}`}
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-container/10 text-crimson-vivid">
                                <Icon name={s.icon} className="text-[22px]" />
                            </span>
                            <div className="min-w-0">
                                <div
                                    dir={s.ltr ? "ltr" : undefined}
                                    className="truncate font-headline-md text-headline-md font-extrabold text-charcoal-dark"
                                >
                                    {s.value}
                                </div>
                                <div className="truncate font-label-md text-label-md text-secondary">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─────────── BİZ KİMİZ ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-10">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-7">
                        <SectionHead eyebrow={a.storyEyebrow} title={a.storyTitle} />
                        <div className="mt-6 space-y-5">
                            {a.story.map((p, i) => (
                                <p key={i} className="font-body-md text-body-md leading-relaxed text-secondary md:font-body-lg md:text-body-lg">
                                    {interpolate(p, vars)}
                                </p>
                            ))}
                        </div>
                    </div>

                    {/* Değerler + TÜRSAB kartı */}
                    <aside className="lg:col-span-5">
                        <div className="rounded-3xl bg-canvas-offwhite p-6 sm:p-8">
                            <h3 className="font-label-uppercase text-label-uppercase text-secondary">{a.valuesTitle}</h3>
                            <ul className="mt-5 space-y-3">
                                {a.values.map((v, i) => (
                                    <li
                                        key={v}
                                        className="flex items-center gap-3 rounded-2xl bg-surface-white p-4 shadow-sm"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                                            <Icon name={VALUE_ICONS[i]} className="text-[20px]" />
                                        </span>
                                        <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{v}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-charcoal-dark to-charcoal-surface p-5 text-white">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                                    <Icon name="workspace_premium" className="text-[26px] text-crimson-vivid" />
                                </span>
                                <div className="min-w-0">
                                    <div dir="ltr" className="font-headline-sm text-headline-sm font-extrabold rtl:text-end">
                                        TÜRSAB {SITE.tursabNo}
                                    </div>
                                    <div className="font-body-sm text-body-sm text-white/70">{a.tursabCard}</div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            {/* ─────────── HİZMETLER ─────────── */}
            <section className="bg-canvas-offwhite py-16 md:py-20">
                <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
                    <div className="mx-auto max-w-2xl text-center">
                        <SectionHead eyebrow={a.servicesEyebrow} title={a.servicesTitle} center />
                        <p className="mt-3 font-body-md text-body-md text-secondary">{a.servicesText}</p>
                    </div>

                    <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {a.services.map((s, i) => (
                            <li
                                key={s}
                                className="group flex items-center gap-4 rounded-2xl bg-surface-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_35px_-10px_rgba(187,0,38,0.15)]"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container/10 text-crimson-vivid transition-colors group-hover:bg-primary-container group-hover:text-on-primary">
                                    <Icon name={SERVICE_ICONS[i] ?? "check"} className="text-[24px]" />
                                </span>
                                <span className="font-headline-sm text-headline-sm font-bold leading-snug text-charcoal-dark">
                                    {s}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ─────────── YAKLAŞIM ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-10">
                <SectionHead eyebrow={a.approachEyebrow} title={a.approachTitle} />

                <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {a.approach.map((item, i) => (
                        <article
                            key={item.title}
                            className="relative flex flex-col rounded-3xl border border-surface-variant bg-surface-white p-6 sm:p-7"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute end-6 top-5 font-display-hero-mobile text-[48px] font-extrabold leading-none text-surface-variant"
                            >
                                0{i + 1}
                            </span>
                            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-dark text-white">
                                <Icon name={APPROACH_ICONS[i]} className="text-[24px]" />
                            </span>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{item.title}</h3>
                            <p className="mt-3 font-body-sm text-body-sm leading-relaxed text-secondary">{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* ─────────── HEDEF ─────────── */}
            <section className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6 md:pb-20 lg:px-10">
                <figure className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container to-[#8f0019] p-8 text-center text-white sm:p-12">
                    <Icon
                        name="format_quote"
                        className="pointer-events-none absolute -start-2 -top-4 text-[140px] text-white/10"
                    />
                    <span className="relative font-label-uppercase text-label-uppercase text-white/80">{a.missionEyebrow}</span>
                    <blockquote className="relative mx-auto mt-4 max-w-3xl text-balance font-headline-md text-headline-md font-bold leading-snug md:font-headline-lg md:text-headline-lg">
                        {a.mission}
                    </blockquote>
                    <figcaption className="relative mx-auto mt-6 max-w-2xl font-body-md text-body-md text-white/80">
                        {a.closing}
                    </figcaption>
                </figure>
            </section>

            {/* ─────────── İLETİŞİM ÇAĞRISI ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
                <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-charcoal-dark to-charcoal-surface p-6 text-white sm:p-8 lg:flex-row">
                    <div className="flex items-center gap-4 text-center lg:text-start">
                        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container sm:flex">
                            <Icon name="travel_explore" className="text-[28px] text-on-primary" />
                        </span>
                        <div>
                            <h2 className="font-headline-md text-headline-md font-bold text-white">{a.ctaTitle}</h2>
                            <p className="mt-1 font-body-sm text-body-sm text-white/75">{a.ctaText}</p>
                        </div>
                    </div>

                    <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
                        {whatsapp && (
                            <a
                                href={whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-container px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid"
                            >
                                <Icon name="chat" className="text-[18px]" />
                                {a.ctaWhatsapp}
                            </a>
                        )}
                        <Link
                            href="/vip-talep"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white transition-colors hover:bg-white/10"
                        >
                            {a.ctaVip}
                            <Icon name="arrow_forward" className="text-[18px] rtl:-scale-x-100" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}

function SectionHead({ eyebrow, title, center = false }) {
    return (
        <div className={center ? "text-center" : ""}>
            <span className="mb-2 inline-flex items-center gap-2 font-label-uppercase text-label-uppercase text-crimson-vivid">
                <span className="h-[2px] w-6 rounded-full bg-crimson-vivid" />
                {eyebrow}
            </span>
            <h2 className="text-balance font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                {title}
            </h2>
        </div>
    );
}