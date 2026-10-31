"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import BungalowDetailClient from "./BungalowDetailClient";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Listeden gelen tarihler (?checkIn=2027-07-15&checkOut=2027-07-18) tarayıcıda okunur.
 * Sunucuda searchParams okumak sayfayı dinamik yapıp her istekte fonksiyon çalıştırıyordu.
 */
export default function BungalowDetailEntry({ bungalow }) {
    const search = useSearchParams();
    const checkIn = search.get("checkIn") ?? "";
    const checkOut = search.get("checkOut") ?? "";

    // Sabit referans: istemci bileşeni bu nesneye bağlı efekt çalıştırıyor
    const initialDates = useMemo(
        () => ({
            checkIn: ISO.test(checkIn) ? checkIn : undefined,
            checkOut: ISO.test(checkOut) ? checkOut : undefined,
        }),
        [checkIn, checkOut],
    );

    return <BungalowDetailClient bungalow={bungalow} initialDates={initialDates} />;
}
