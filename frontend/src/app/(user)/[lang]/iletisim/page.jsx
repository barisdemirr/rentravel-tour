import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Link from "@/components/ui/LocalizedLink";
import { SITE, waHref } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { isLocale } from "@/lib/i18n/config";
import { buildAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/siteUrl";
import { infoMessage } from "@/lib/whatsapp";

const PATH = "/iletisim";

const pagePath = (lang) => (lang === "tr" ? PATH : `/${lang}${PATH}`);
const homePath = (lang) => (lang === "tr" ? "/" : `/${lang}`);

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const c = getDictionary(lang).contactPage;

    return {
        title: c.metaTitle,
        description: c.metaDescription,
        alternates: buildAlternates(PATH, lang),
        // openGraph üst katmandakini tamamen ezer, bu yüzden eksiksiz verilir
        openGraph: {
            title: `${c.metaTitle} | Rentravel Turizm`,
            description: c.metaDescription,
            url: `${SITE_URL}${pagePath(lang)}`,
            siteName: "Rentravel Turizm",
            images: [{ url: "/logo.png", width: 512, height: 512, alt: "Rentravel Turizm" }],
            type: "website",
        },
    };
}

export default async function ContactPage({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) notFound();

    const c = getDictionary(lang).contactPage;
    const whatsapp = waHref(infoMessage({ locale: lang }));
    const address = encodeURIComponent(SITE.address);
    const mapSrc = `https://maps.google.com/maps?q=${address}&z=16&hl=${lang}&output=embed`;
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${address}`;

    const quickActions = [
        { icon: "call", title: c.quick.phone, sub: c.quick.phoneSub, value: SITE.phone, href: SITE.phoneHref, ltr: true },
        whatsapp && {
            icon: "chat",
            title: c.quick.whatsapp,
            sub: c.quick.whatsappSub,
            value: SITE.phone,
            href: whatsapp,
            external: true,
            ltr: true,
            highlight: true,
        },
        { icon: "mail", title: c.quick.email, sub: c.quick.emailSub, value: SITE.email, href: `mailto:${SITE.email}`, ltr: true },
    ].filter(Boolean);

    const socials = [
        SITE.instagram && { icon: "photo_camera", label: "Instagram", handle: SITE.instagramHandle, href: SITE.instagram },
        SITE.tiktok && { icon: "music_note", label: "TikTok", handle: SITE.tiktokHandle, href: SITE.tiktok },
    ].filter(Boolean);

    const structuredData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "ContactPage",
                url: `${SITE_URL}${pagePath(lang)}`,
                name: c.metaTitle,
                about: { "@id": `${SITE_URL}/#organization` },
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: c.home, item: `${SITE_URL}${homePath(lang)}` },
                    { "@type": "ListItem", position: 2, name: c.metaTitle, item: `${SITE_URL}${pagePath(lang)}` },
                ],
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            {/* ─────────── HERO ─────────── */}
            <section className="relative overflow-hidden bg-charcoal-dark pb-28 pt-10 md:pb-36 md:pt-14">
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
                    <nav aria-label={c.breadcrumbLabel} className="mb-8">
                        <ol className="flex items-center gap-1.5 font-label-md text-label-md text-white/60">
                            <li>
                                <Link href="/" className="transition-colors hover:text-white">
                                    {c.home}
                                </Link>
                            </li>
                            <li aria-hidden="true">
                                <Icon name="chevron_right" className="text-[16px] rtl:-scale-x-100" />
                            </li>
                            <li aria-current="page" className="text-white">
                                {c.metaTitle}
                            </li>
                        </ol>
                    </nav>

                    <div className="max-w-3xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur-md">
                            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-crimson-vivid" />
                            <span className="font-label-uppercase text-label-uppercase text-white">{c.eyebrow}</span>
                        </div>

                        <h1 className="text-balance font-display-hero-mobile text-display-hero-mobile font-extrabold text-white md:font-display-hero md:text-display-hero">
                            {c.heroTitle}{" "}
                            <span className="bg-gradient-to-r from-crimson-vivid to-[#ff6b7d] bg-clip-text text-transparent">
                                {c.heroAccent}
                            </span>
                        </h1>

                        <p className="mt-5 max-w-2xl font-body-md text-body-md text-white/75 md:font-body-lg md:text-body-lg">
                            {c.heroText}
                        </p>
                    </div>
                </div>
            </section>

            {/* ─────────── HIZLI İLETİŞİM KARTLARI ─────────── */}
            <section className="relative z-20 mx-auto -mt-16 w-full max-w-6xl px-4 sm:px-6 lg:px-10">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {quickActions.map((q) => (
                        <a
                            key={q.title}
                            href={q.href}
                            {...(q.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className={`group flex items-center gap-4 rounded-3xl p-5 shadow-[0_20px_40px_-15px_rgba(15,17,21,0.12)] transition-all duration-300 hover:-translate-y-1 sm:p-6 ${q.highlight
                                    ? "bg-gradient-to-br from-primary-container to-[#8f0019] text-white"
                                    : "bg-surface-white text-charcoal-dark"
                                }`}
                        >
                            <span
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${q.highlight
                                        ? "bg-white/15 text-white"
                                        : "bg-primary-container/10 text-crimson-vivid group-hover:bg-primary-container group-hover:text-on-primary"
                                    } transition-colors`}
                            >
                                <Icon name={q.icon} className="text-[24px]" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className={`font-label-uppercase text-label-uppercase ${q.highlight ? "text-white/75" : "text-secondary"}`}>
                                    {q.title}
                                </div>
                                <div dir={q.ltr ? "ltr" : undefined} className="truncate font-headline-sm text-headline-sm font-bold rtl:text-end">
                                    {q.value}
                                </div>
                                <div className={`truncate font-body-sm text-body-sm ${q.highlight ? "text-white/70" : "text-secondary"}`}>
                                    {q.sub}
                                </div>
                            </div>
                            <Icon
                                name="arrow_outward"
                                className={`shrink-0 text-[20px] transition-transform group-hover:-translate-y-0.5 rtl:-scale-x-100 ${q.highlight ? "text-white/80" : "text-secondary/50 group-hover:text-crimson-vivid"
                                    }`}
                            />
                        </a>
                    ))}
                </div>
            </section>

            {/* ─────────── BİLGİLER + HARİTA ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
                    {/* Bilgiler */}
                    <div className="lg:col-span-5">
                        <span className="mb-2 inline-flex items-center gap-2 font-label-uppercase text-label-uppercase text-crimson-vivid">
                            <span className="h-[2px] w-6 rounded-full bg-crimson-vivid" />
                            {c.infoEyebrow}
                        </span>
                        <h2 className="text-balance font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                            {c.infoTitle}
                        </h2>

                        <dl className="mt-8 space-y-3">
                            <InfoRow icon="location_on" label={c.address}>
                                <address className="not-italic">{SITE.address}</address>
                            </InfoRow>
                            <InfoRow icon="call" label={c.phone}>
                                <a href={SITE.phoneHref} dir="ltr" className="transition-colors hover:text-crimson-vivid">
                                    {SITE.phone}
                                </a>
                            </InfoRow>
                            <InfoRow icon="mail" label={c.email}>
                                <a href={`mailto:${SITE.email}`} dir="ltr" className="break-all transition-colors hover:text-crimson-vivid">
                                    {SITE.email}
                                </a>
                            </InfoRow>
                        </dl>

                        {socials.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-label-uppercase text-label-uppercase text-secondary">{c.social}</h3>
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {socials.map((s) => (
                                        <a
                                            key={s.label}
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 rounded-2xl border border-surface-variant bg-surface-white p-4 transition-all hover:border-crimson-vivid hover:shadow-md"
                                        >
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal-dark text-white transition-colors group-hover:bg-primary-container">
                                                <Icon name={s.icon} className="text-[20px]" />
                                            </span>
                                            <div className="min-w-0">
                                                <div className="font-label-md text-label-md text-secondary">{s.label}</div>
                                                <div dir="ltr" className="truncate font-headline-sm text-headline-sm font-bold text-charcoal-dark rtl:text-end">
                                                    {s.handle}
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Harita */}
                    <div className="lg:col-span-7">
                        <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-surface-white shadow-[0_20px_40px_-15px_rgba(15,17,21,0.12)]">
                            <div className="relative min-h-[320px] flex-1 bg-canvas-offwhite md:min-h-[420px]">
                                <iframe
                                    title={c.mapTitle}
                                    src={mapSrc}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    allowFullScreen
                                    className="absolute inset-0 h-full w-full border-0"
                                />
                            </div>
                            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                                        <Icon name="storefront" className="text-[20px]" />
                                    </span>
                                    <div>
                                        <div className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{c.officeTitle}</div>
                                        <p className="font-body-sm text-body-sm text-secondary">{c.officeText}</p>
                                    </div>
                                </div>
                                <a
                                    href={directionsHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-charcoal-dark px-5 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-white transition-colors hover:bg-primary-container"
                                >
                                    <Icon name="directions" className="text-[18px]" />
                                    {c.directions}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── ÇAĞRI ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
                <div className="flex flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-charcoal-dark to-charcoal-surface p-6 text-white sm:p-8 lg:flex-row">
                    <div className="flex items-center gap-4 text-center lg:text-start">
                        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-container sm:flex">
                            <Icon name="concierge" className="text-[28px] text-on-primary" />
                        </span>
                        <div>
                            <h2 className="font-headline-md text-headline-md font-bold text-white">{c.ctaTitle}</h2>
                            <p className="mt-1 font-body-sm text-body-sm text-white/75">{c.ctaText}</p>
                        </div>
                    </div>
                    <Link
                        href="/vip-talep"
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary-container px-6 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid sm:w-auto"
                    >
                        {c.ctaButton}
                        <Icon name="arrow_forward" className="text-[18px] rtl:-scale-x-100" />
                    </Link>
                </div>
            </section>
        </>
    );
}

function InfoRow({ icon, label, children }) {
    return (
        <div className="flex items-start gap-4 rounded-2xl bg-canvas-offwhite p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-white text-crimson-vivid shadow-sm">
                <Icon name={icon} className="text-[22px]" />
            </span>
            <div className="min-w-0">
                <dt className="font-label-uppercase text-label-uppercase text-secondary">{label}</dt>
                <dd className="mt-0.5 font-headline-sm text-headline-sm font-bold text-charcoal-dark">{children}</dd>
            </div>
        </div>
    );
}