import Icon from "@/components/ui/Icon";
import Link from "@/components/ui/LocalizedLink";
import { SITE, waHref } from "@/lib/constants";
import { infoMessage } from "@/lib/whatsapp";

const LINKS = [
    { href: "/arac-kiralama", icon: "directions_car", key: "cars" },
    { href: "/gunubirlik-turlar", icon: "hiking", key: "dailyTours" },
    { href: "/konaklamali-turlar", icon: "castle", key: "cultureTours" },
    { href: "/bungalov-konaklama", icon: "cottage", key: "bungalow" },
];

export default function NotFoundView({ dict, locale }) {
    const n = dict.notFound;
    const whatsapp = waHref(infoMessage({ locale }));

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-16 text-center sm:px-8 md:py-24">
            {/* Kod */}
            <span
                dir="ltr"
                aria-hidden="true"
                className="bg-gradient-to-b from-crimson-vivid to-[#8f0019] bg-clip-text font-display-hero-mobile text-[88px] font-extrabold leading-none tracking-tighter text-transparent sm:text-[120px]"
            >
                {n.code}
            </span>

            <h1 className="mt-4 text-pretty font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                {n.title}
            </h1>

            <p className="mt-3 max-w-md font-body-md text-body-md leading-relaxed text-secondary">{n.text}</p>

            <Link
                href="/"
                className="mt-7 flex h-13 items-center gap-2 rounded-2xl bg-gradient-to-br from-crimson-vivid to-[#a80320] px-7 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-[0_10px_30px_-8px_rgba(217,4,41,0.5)] transition-all hover:brightness-110 active:scale-[0.98]"
            >
                <Icon name="home" className="text-[20px]" />
                {n.home}
            </Link>

            {/* Popüler sayfalar */}
            <div className="mt-12 w-full">
                <span className="font-label-uppercase text-label-uppercase font-bold tracking-wider text-secondary">
                    {n.popular}
                </span>

                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group flex items-center gap-3 rounded-2xl border border-surface-variant bg-surface-white p-4 text-start transition-all hover:-translate-y-0.5 hover:border-crimson-vivid hover:shadow-md"
                        >
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas-offwhite text-crimson-vivid transition-colors group-hover:bg-crimson-vivid group-hover:text-white">
                                <Icon name={link.icon} className="text-[22px]" />
                            </span>
                            <span className="min-w-0 flex-1 truncate font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                {dict.nav[link.key]}
                            </span>
                            <Icon
                                name="arrow_forward"
                                className="shrink-0 text-[18px] text-secondary/40 transition-colors group-hover:text-crimson-vivid rtl:-scale-x-100"
                            />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Yardım */}
            <div className="mt-10 flex w-full flex-col items-center gap-3 rounded-3xl bg-canvas-offwhite p-5 sm:flex-row sm:justify-between sm:p-6 sm:text-start">
                <div className="min-w-0">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">{n.help}</h2>
                    <p className="mt-1 font-body-sm text-body-sm text-secondary">{n.helpText}</p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <a
                        href={whatsapp ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-2xl bg-primary-container px-5 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid"
                    >
                        <Icon name="chat" className="shrink-0 text-[18px]" />
                        {n.whatsapp}
                    </a>
                    <a
                        href={SITE.phoneHref}
                        className="flex items-center justify-center gap-2 rounded-2xl border border-surface-variant bg-surface-white px-5 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-charcoal-dark transition-colors hover:bg-surface-variant"
                    >
                        <Icon name="call" className="shrink-0 text-[18px] text-crimson-vivid" />
                        <span dir="ltr">{SITE.phone}</span>
                    </a>
                </div>
            </div>
        </div>
    );
}