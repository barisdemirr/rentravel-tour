import { notFound } from "next/navigation";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { adminFetch } from "@/lib/admin/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    return { title: `${id === "yeni" ? "Yeni Slayt" : "Slayt Düzenle"} | Rentravel Yönetim` };
}

export default async function HeroSlideFormPage({ params }) {
    const { id } = await params;
    const record = await adminFetch(`/admin/hero-slides/${id}`);

    if (!record.data) notFound();

    return <HeroSlideForm record={record.data} nextOrder={0} />;
}