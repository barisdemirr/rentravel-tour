import AgeRulesClient from "./AgeRulesClient";
import { loadOwners } from "@/lib/admin/owners";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yaş Fiyatları | Rentravel Yönetim" };

// Araçlarda çocuk fiyatı yok
const TYPES = ["DailyTour", "CultureTour", "Bungalow"];

export default async function AgeRulesPage({ searchParams }) {
    const sp = await searchParams;
    const ownerType = TYPES.includes(sp?.ownerType) ? sp.ownerType : "DailyTour";
    const ownerId = typeof sp?.ownerId === "string" ? sp.ownerId : "";

    const groups = await loadOwners(TYPES);

    const rules = ownerId
        ? await adminFetch(`/admin/age-price-rules?ownerType=${ownerType}&ownerId=${ownerId}`, { fallback: [] })
        : { data: [] };

    const owner = groups.find((g) => g.value === ownerType)?.items.find((i) => i.id === ownerId);

    return (
        <AgeRulesClient
            groups={groups}
            ownerType={ownerType}
            ownerId={ownerId}
            ownerLabel={owner?.label}
            currency={owner?.currency ?? "TRY"}
            rules={asList(rules.data)}
        />
    );
}