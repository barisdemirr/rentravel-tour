import PriceRulesClient from "./PriceRulesClient";
import { loadOwners } from "@/lib/admin/owners";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dönemsel Fiyatlar | Rentravel Yönetim" };

const TYPES = ["Vehicle", "DailyTour", "Bungalow"];

export default async function PriceRulesPage({ searchParams }) {
    const sp = await searchParams;
    const ownerType = TYPES.includes(sp?.ownerType) ? sp.ownerType : "Vehicle";
    const ownerId = typeof sp?.ownerId === "string" ? sp.ownerId : "";

    // Kültür turları burada yok: fiyatı konaklama tipinden geliyor
    const groups = await loadOwners(TYPES);

    const rules = ownerId
        ? await adminFetch(`/admin/price-rules?ownerType=${ownerType}&ownerId=${ownerId}`, { fallback: [] })
        : { data: [] };

    const owner = groups.find((g) => g.value === ownerType)?.items.find((i) => i.id === ownerId);

    return (
        <PriceRulesClient
            groups={groups}
            ownerType={ownerType}
            ownerId={ownerId}
            ownerLabel={owner?.label}
            currency={owner?.currency ?? "TRY"}
            rules={asList(rules.data)}
        />
    );
}