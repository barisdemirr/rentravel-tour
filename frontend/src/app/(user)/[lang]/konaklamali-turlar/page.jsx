import { settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buildAlternates } from "@/lib/seo";
import { getCultureTours, getTourCategories } from "@/services";
import CultureToursClient from "./CultureToursClient";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const l = getDictionary(lang).cultureList;
    return {
        title: l.metaTitle,
        description: l.metaDescription,
        alternates: buildAlternates("/konaklamali-turlar", lang),
    };
}

export default async function CultureToursPage() {
    const [tours, categories] = await Promise.all([
        settle(getCultureTours(), []),
        settle(getTourCategories("culture"), []),
    ]);

    return <CultureToursClient tours={tours.data} categories={categories.data} failed={Boolean(tours.error)} />;
}