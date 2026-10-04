import SessionsClient from "./SessionsClient";
import { loadOwners } from "@/lib/admin/owners";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tur Seferleri | Rentravel Yönetim" };

// Seferlerde tür adları farklı: Daily / Culture
const TYPES = { Daily: "DailyTour", Culture: "CultureTour" };

export default async function SessionsPage({ searchParams }) {
    const sp = await searchParams;
    const tourType = Object.keys(TYPES).includes(sp?.tourType) ? sp.tourType : "Daily";
    const tourId = typeof sp?.tourId === "string" ? sp.tourId : "";

    const owners = await loadOwners([TYPES[tourType] === "DailyTour" ? "DailyTour" : "CultureTour"]);

    // Sahip seçici iki seçenek gösterir, listeyi seçili tür için yükleriz
    const both = await loadOwners(["DailyTour", "CultureTour"]);
    const groups = [
        { ...both[0], value: "Daily", label: "Günübirlik Turlar" },
        { ...both[1], value: "Culture", label: "Kültür Turları" },
    ];

    const sessions = tourId
        ? await adminFetch(`/admin/tour-sessions?tourType=${tourType}&tourId=${tourId}`, { fallback: [] })
        : { data: [] };

    const tour = groups.find((g) => g.value === tourType)?.items.find((i) => i.id === tourId);

    return (
        <SessionsClient
            groups={groups}
            tourType={tourType}
            tourId={tourId}
            tourLabel={tour?.label}
            currency={tour?.currency ?? "TRY"}
            sessions={asList(sessions.data)}
        />
    );
}