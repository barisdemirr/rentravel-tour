import TestimonialsClient from "./TestimonialsClient";
import { adminFetch } from "@/lib/admin/server";
import { asList } from "@/lib/admin/reorder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Müşteri Yorumları | Rentravel Yönetim" };

export default async function TestimonialsPage() {
    const { data, error } = await adminFetch("/admin/testimonials", { fallback: [] });
    return <TestimonialsClient rows={asList(data)} failed={Boolean(error)} />;
}