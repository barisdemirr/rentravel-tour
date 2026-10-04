import { getBungalowRegions } from "@/services/bungalowRegions";
import BungalovClient from "./BungalovClient";

export const metadata = {
    title: "Bungalov Konaklama | Rentravel Turizm",
    description:
        "Doğu Karadeniz'in en seçkin lüks bungalov ve dağ evleri. Fırtına Vadisi, Ayder, Pokut, Şavşat ve daha fazlası.",
};

export default async function BungalovKonaklamaPage() {
    let regions = [];
    let errorMessage = null;

    try {
        regions = await getBungalowRegions();
    } catch (err) {
        errorMessage = err?.title || "Bölge verisi alınamadı.";
        console.error("[bungalov-konaklama] Bölge hatası:", err);
    }

    return (
        <BungalovClient
            initialRegions={regions}
            initialError={errorMessage}
        />
    );
}