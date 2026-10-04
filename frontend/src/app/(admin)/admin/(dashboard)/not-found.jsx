import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function AdminNotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ad-brand-soft text-ad-brand">
                <Icon name="search_off" className="text-[30px]" />
            </span>
            <div>
                <h1 className="text-xl font-extrabold">Sayfa bulunamadı</h1>
                <p className="mt-1.5 text-sm text-ad-muted">
                    Aradığınız kayıt silinmiş veya adres hatalı olabilir.
                </p>
            </div>
            <Link
                href="/admin"
                className="mt-1 flex h-11 items-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125"
            >
                <Icon name="dashboard" className="text-[18px]" />
                Panele dön
            </Link>
        </div>
    );
}