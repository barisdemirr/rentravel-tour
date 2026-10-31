"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import VehicleDetailClient from "./VehicleDetailClient";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

/**
 * Listeden gelen tarihler (?pickupDate=2027-07-15&pickupTime=10:00&returnDate=2027-07-18&returnTime=10:00)
 * tarayıcıda okunur. Sunucuda searchParams okumak sayfayı "dinamik" yapıp her ziyarette (ve her kartın
 * ön yüklemesinde) sunucu fonksiyonu çalıştırıyordu; burada sayfa statik kalır.
 */
export default function VehicleDetailEntry({ vehicle }) {
    const search = useSearchParams();
    const pickupDate = search.get("pickupDate") ?? "";
    const returnDate = search.get("returnDate") ?? "";
    const pickupTime = search.get("pickupTime") ?? "";
    const returnTime = search.get("returnTime") ?? "";

    // Sabit referans: istemci bileşeni bu nesneye bağlı efekt çalıştırıyor
    const initialDates = useMemo(() => {
        if (!DATE.test(pickupDate) || !DATE.test(returnDate)) return null;
        return {
            pickupDate,
            returnDate,
            pickupTime: TIME.test(pickupTime) ? pickupTime : "10:00",
            returnTime: TIME.test(returnTime) ? returnTime : "10:00",
        };
    }, [pickupDate, returnDate, pickupTime, returnTime]);

    return <VehicleDetailClient vehicle={vehicle} initialDates={initialDates} />;
}
