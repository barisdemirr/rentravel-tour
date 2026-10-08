import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { adminFetch } from "@/lib/admin/server";
import { asList, nextIndex } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Yeni Slayt | Rentravel Yönetim" };

export default async function NewHeroSlidePage() {
    const list = await adminFetch("/admin/hero-slides", { fallback: [] });

    return <HeroSlideForm nextOrder={nextIndex(asList(list.data))} />;
}