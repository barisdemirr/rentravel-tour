import { settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buildAlternates } from "@/lib/seo";
import { getDailyTours, getTourCategories } from "@/services";
import DailyToursClient from "./DailyToursClient";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const l = getDictionary(lang).dailyList;
    return {
        title: l.metaTitle,
        description: l.metaDescription,
        alternates: buildAlternates("/gunubirlik-turlar", lang),
    };
}

export default async function DailyToursPage() {
    const [tours, categories] = await Promise.all([
        settle(getDailyTours(), []),
        settle(getTourCategories("daily"), []),
    ]);

    return (
        <DailyToursClient
            tours={tours.data}
            categories={categories.data}
            failed={Boolean(tours.error)}
        />
    );
}