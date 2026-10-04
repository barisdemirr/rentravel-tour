import { settle } from "@/lib/api";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { buildAlternates } from "@/lib/seo";
import { getBungalowRegions, getBungalows } from "@/services";
import BungalovClient from "./BungalovClient";

export async function generateMetadata({ params }) {
    const { lang } = await params;
    if (!isLocale(lang)) return {};

    const l = getDictionary(lang).bungalowList;
    return {
        title: l.metaTitle,
        description: l.metaDescription,
        alternates: buildAlternates("/bungalov-konaklama", lang),
    };
}

export default async function BungalowListPage() {
    const [bungalows, regions] = await Promise.all([
        settle(getBungalows(), []),
        settle(getBungalowRegions(), []),
    ]);

    return (
        <BungalovClient
            bungalows={bungalows.data}
            regions={regions.data}
            failed={Boolean(bungalows.error)}
        />
    );
}