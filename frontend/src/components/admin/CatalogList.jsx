"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, NewButton, PageHeader, StatusBadge } from "@/components/admin/DataList";
import { useToast } from "@/components/admin/Toast";
import { adminDelete } from "@/lib/admin/client";

export default function CatalogList({ slug, catalog, rows, failed }) {
    const router = useRouter();
    const toast = useToast();
    const [target, setTarget] = useState(null);

    const base = `/admin/katalog/${slug}`;
    const titleOf = (row) => row[catalog.titleField]?.tr || row.key;

    const remove = async () => {
        try {
            await adminDelete(`/admin/${catalog.api}/${target.id}`);
            toast.success(`"${titleOf(target)}" silindi.`);
            setTarget(null);
            router.refresh();
        } catch (e) {
            // 409: başka bir kayıt bu kataloğu kullanıyor olabilir
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const columns = [
        {
            key: "title",
            header: catalog.singular,
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ad-brand-soft text-ad-brand">
                        <Icon name={row.icon || catalog.icon} className="text-[20px]" />
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{titleOf(row)}</div>
                        <code dir="ltr" className="text-xs text-ad-faint">
                            {row.key}
                        </code>
                    </div>
                </div>
            ),
        },
        ...(catalog.extraColumns ?? []),
        { key: "order", header: "Sıra", hideOnMobile: true, className: "w-20", render: (row) => row.orderIndex ?? 0 },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title={catalog.title}
                description={catalog.description}
                action={<NewButton href={`${base}/yeni`} label={`${catalog.singular} Ekle`} />}
            />

            {failed ? (
                <EmptyState icon="cloud_off" title="Veriler yüklenemedi" text="Sunucuya ulaşılamıyor, sayfayı yenileyin." />
            ) : (
                <DataList
                    rows={rows}
                    columns={columns}
                    empty={
                        <EmptyState
                            icon={catalog.icon}
                            title="Henüz kayıt yok"
                            text={`İlk ${catalog.singular.toLocaleLowerCase("tr")} kaydını ekleyerek başlayın.`}
                        >
                            <div className="mt-2">
                                <NewButton href={`${base}/yeni`} label={`${catalog.singular} Ekle`} />
                            </div>
                        </EmptyState>
                    }
                    actions={(row) => [
                        { label: "Düzenle", icon: "edit", href: `${base}/${row.id}` },
                        { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                    ]}
                />
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title={`"${target ? titleOf(target) : ""}" silinsin mi?`}
                message="Kayıt listelerden kaldırılır. Bu kataloğu kullanan ürünler varsa silme işlemi reddedilebilir."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}