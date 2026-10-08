import HeroSlideList from "./HeroSlideList";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ana Sayfa Slider | Rentravel Yönetim" };

export default async function HeroSlidesPage() {
    const { data, error } = await adminFetch("/admin/hero-slides", { fallback: [] });
    const rows = Array.isArray(data) ? data : (data?.items ?? []);

    return <HeroSlideList rows={rows} failed={Boolean(error)} />;
}