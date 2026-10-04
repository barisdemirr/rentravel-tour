import LoadingSignal from "@/components/ui/LoadingSignal";

// Sayfa veri beklerken ekranda aynı (tek) splash kalır, ayrı bir splash daha açılmaz
export default function Loading() {
    return <LoadingSignal />;
}