import VipRequestClient from "./VipRequestClient";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const v = getDictionary(lang).vip;
    return {
        title: v.metaTitle,
        description: v.metaDescription,
        alternates: buildAlternates("/vip-talep", lang),
        robots: { index: true, follow: true },
    };
}

export default function VipRequestPage() {
    return <VipRequestClient />;
}