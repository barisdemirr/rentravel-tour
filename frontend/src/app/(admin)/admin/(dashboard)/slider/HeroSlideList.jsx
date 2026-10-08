"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, NewButton, PageHeader, StatusBadge } from "@/components/admin/DataList";
import { useToast } from "@/components/admin/Toast";
import { adminDelete } from "@/lib/admin/client";
import { absoluteUrl } from "@/lib/admin/media";
import { localized } from "@/lib/i18n/localized";

export default function HeroSlideList({ rows, failed }) {
    const router = useRouter();
    const toast = useToast();
    const [target, setTarget] = useState(null);

    const sorted = useMemo(
        () => [...rows].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
        [rows]
    );

    const remove = async () => {
        try {
            await adminDelete(`/admin/hero-slides/${target.id}`);
            toast.success("Slayt silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const columns = [
        {
            key: "slide",
            header: "Slayt",
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-ad-sunken">
                        {row.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={absoluteUrl(row.image.url)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-ad-faint">
                                <Icon name="image" className="text-[20px]" />
                            </span>
                        )}
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{row.title?.tr}</div>
                        {row.badge && <span className="text-xs text-ad-faint">{row.badge}</span>}
                    </div>
                </div>
            ),
        },
        {
            key: "cta",
            header: "Buton",
            render: (row) => (
                <div className="min-w-0">
                    <div className="truncate text-sm">{row.ctaLabel?.tr || "—"}</div>
                    <code dir="ltr" className="block truncate text-xs text-ad-faint">{row.ctaHref || "—"}</code>
                </div>
            ),
        },
        { key: "order", header: "Sıra", className: "w-20", render: (row) => row.orderIndex ?? 0 },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title="Ana Sayfa Slider"
                description="Ana sayfadaki dönen görselleri, başlıkları ve buton bağlantılarını yönetin."
                action={<NewButton href="/admin/slider/yeni" label="Slayt Ekle" />}
            />

            {failed ? (
                <EmptyState icon="cloud_off" title="Veriler yüklenemedi" text="Sunucuya ulaşılamıyor." />
            ) : (
                <DataList
                    rows={sorted}
                    columns={columns}
                    empty={
                        <EmptyState
                            icon="image"
                            title="Henüz slayt eklenmemiş"
                            text="İlk slaytı ekleyerek başlayın."
                        >
                            <div className="mt-2">
                                <NewButton href="/admin/slider/yeni" label="Slayt Ekle" />
                            </div>
                        </EmptyState>
                    }
                    actions={(row) => [
                        { label: "Düzenle", icon: "edit", href: `/admin/slider/${row.id}` },
                        { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                    ]}
                />
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title="Slayt silinsin mi?"
                message="Bu slayt ana sayfa slider'ından kaldırılır. Geri getirilemez."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}