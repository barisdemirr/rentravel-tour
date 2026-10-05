import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Link from "@/components/ui/LocalizedLink";
import { ApiError, settle } from "@/lib/api";
import { SITE, waHref } from "@/lib/constants";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { localized } from "@/lib/i18n/localized";
import { buildAlternates } from "@/lib/seo";
import { infoMessage } from "@/lib/whatsapp";
import { getStaticPageBySlug, getStaticPages } from "@/services/staticPages";
import { formatDateTime } from "@/lib/format";

export const revalidate = 300;

/**
 * Statik sayfa olamayacak adresler: bot taramaları ve yanlış yazımlar
 * backend'e gitmeden 404 alsın.
 */
const INVALID_SLUG = /^[^a-z0-9]|[^a-z0-9-]|--|^.{0,1}$|^.{101,}$/;

const BLOCKED = new Set([
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
    "wp-admin",
    "wp-login.php",
    "admin",
    "api",
    "_next",
]);

const isLikelySlug = (slug) => !BLOCKED.has(slug) && !INVALID_SLUG.test(slug);

export async function generateMetadata({ params }) {
    const { lang, slug } = await params;
    if (!isLocale(lang) || !isLikelySlug(slug)) return {};

    const { data: page } = await settle(getStaticPageBySlug(slug), null);
    if (!page) return {};

    const title = localized(page.seoTitle, lang) || localized(page.title, lang);
    const description = localized(page.seoDescription, lang);

    return {
        title,
        description: description || undefined,
        alternates: buildAlternates(`/${slug}`, lang),
        openGraph: { title, description: description || undefined, type: "article" },
    };
}

export default async function StaticPage({ params }) {
    const { lang, slug } = await params;
    if (!isLikelySlug(slug)) notFound();
    const locale = isLocale(lang) ? lang : "tr";
    const t = getDictionary(locale).staticPage;

    const [page, others] = await Promise.all([
        settle(getStaticPageBySlug(slug), null),
        settle(getStaticPages(), []),
    ]);

    // Bilinmeyen adres: 404. Başka bir hata varsa Next hata sayfası devralır.
    if (page.error instanceof ApiError && page.error.status === 404) notFound();
    if (page.error) throw page.error;
    if (!page.data) notFound();

    const doc = page.data;
    const title = localized(doc.title, locale);
    const content = localized(doc.content, locale);
    const updated = doc.updatedAt ?? doc.createdAt;

    // Alt menüdeki diğer sayfalar (bu hariç)
    const links = (Array.isArray(others.data) ? others.data : []).filter((p) => p.slug !== slug);

    const whatsapp = waHref(infoMessage({ topic: localized(doc.title, "tr"), locale }));

    return (
        <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-4 md:px-8 md:pb-20 md:pt-6">
            {/* Breadcrumb */}
            <nav
                aria-label={t.breadcrumbLabel}
                className="no-scrollbar mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label-md text-label-md text-secondary"
            >
                <Link href="/" className="transition-colors hover:text-crimson-vivid">
                    {t.home}
                </Link>
                <Icon name="chevron_right" className="text-[14px] rtl:-scale-x-100" />
                <span className="font-semibold text-charcoal-dark">{title}</span>
            </nav>

            {/* Başlık */}
            <header className="mb-6 border-b border-surface-variant pb-6">
                <h1 className="break-words font-headline-lg-mobile text-headline-lg-mobile font-extrabold leading-tight tracking-tight text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                    {title}
                </h1>

                {updated && (
                    <p className="mt-3 flex items-center gap-1.5 font-label-md text-label-md text-secondary">
                        <Icon name="update" className="shrink-0 text-[16px] text-crimson-vivid" />
                        {t.updatedAt.replace("{date}", formatDateTime(updated, locale))}
                    </p>
                )}
            </header>

            {/* İçerik: panelde kaydedilirken temizlenmiş HTML */}
            <article className="rich-text" dangerouslySetInnerHTML={{ __html: content }} />

            {/* İletişim */}
            <section className="mt-10 flex flex-col gap-4 rounded-3xl bg-canvas-offwhite p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                        {t.contactTitle}
                    </h2>
                    <p className="mt-1 font-body-sm text-body-sm text-secondary">{t.contactText}</p>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <a
                        href={whatsapp ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-container px-5 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary shadow-md transition-colors hover:bg-crimson-vivid"
                    >
                        <Icon name="chat" className="text-[18px]" />
                        {t.contactWhatsapp}
                    </a>
                    <a
                        href={SITE.phoneHref}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-surface-variant bg-surface-white px-5 py-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-charcoal-dark transition-colors hover:bg-surface-variant"
                    >
                        <Icon name="call" className="text-[18px]" />
                        <span dir="ltr">{SITE.phone}</span>
                    </a>
                </div>
            </section>

            {/* Diğer sayfalar */}
            {links.length > 0 && (
                <section className="mt-8">
                    <h2 className="mb-3 font-label-uppercase text-label-uppercase font-bold tracking-wider text-secondary">
                        {t.otherPages}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {links.map((p) => (
                            <Link
                                key={p.slug}
                                href={`/${p.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-surface-variant bg-surface-white px-4 py-2 font-label-md text-label-md font-semibold text-charcoal-dark transition-colors hover:border-crimson-vivid hover:text-crimson-vivid"
                            >
                                <Icon name="description" className="text-[16px] text-crimson-vivid" />
                                {localized(p.title, locale)}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}