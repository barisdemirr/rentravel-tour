import { getVehicleSegments } from "@/services/vehicleSegments";
import CarRentalClient from "./CarRentalClient";

export const metadata = {
    title: "Araç Kiralama | Rentravel Turizm",
    description:
        "Trabzon Havalimanı ve Doğu Karadeniz bölgesinde lüks araç kiralama. Mercedes Vito, SUV ve sedan seçenekleri. 7/24 havalimanı teslimat, tam kasko.",
};

export default async function CarRentalPage() {
    let segments = [];
    let errorMessage = null;

    try {
        segments = await getVehicleSegments();
    } catch (err) {
        errorMessage = err?.title || "Segment verisi alınamadı.";
        console.error("[arac-kiralama] Segment hatası:", err);
    }

    return (
        <CarRentalClient
            initialSegments={segments}
            initialError={errorMessage}
        />
    );
}