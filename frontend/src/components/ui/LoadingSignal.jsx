"use client";

import { useNavigationPending } from "@/lib/navigation/NavigationProvider";

// Görünmez: bulunduğu sürece "yükleniyor" sayılır
export default function LoadingSignal() {
    useNavigationPending(true);
    return null;
}