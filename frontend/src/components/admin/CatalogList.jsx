"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, NewButton, PageHeader, StatusBadge } from "@/components/admin/DataList";
import OrderEditor from "@/components/admin/OrderEditor";
import { useToast } from "@/components/admin/Toast";
import { adminDelete, adminPut } from "@/lib/admin/client";
import { catalogPayload } from "@/lib/admin/catalogs";
import { sortByOrder } from "@/lib/admin/reorder";

export default function CatalogList({ slug, catalog, rows, failed }) {
    const router = useRouter();
    const toast = useToast();
    const [target, setTarget] = useState(null);
    const [ordering, setOrdering] = useState(false);

    const base = `/admin/katalog/${slug}`;
    const sorted = useMemo(() => sortByOrder(rows), [rows]);
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

    const saveOrder = async (diff) => {
        // Sırayla gönderilir: aynı anda birden fazla PUT'ta çakışma riski var
        for (const row of diff) {
            await adminPut(`/admin/${catalog.api}/${row.id}`, catalogPayload(catalog, row));
        }
        router.refresh();
    };

    /* Sıralama modunda gösterilen satır */
    const orderItem = (row) => (
        <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ad-brand-soft text-ad-brand">
                <Icon name={row.icon || catalog.icon} className="text-[18px]" />
            </span>
            <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{titleOf(row)}</div>
                {!row.isActive && <span className="text-[11px] font-semibold text-ad-muted">Pasif</span>}
            </div>
        </div>
    );

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
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title={catalog.title}
                description={catalog.description}
                action={
                    ordering ? null : (
                        <div className="flex shrink-0 items-center gap-2">
                            {sorted.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => setOrdering(true)}
                                    className="flex h-11 items-center gap-2 rounded-xl border border-ad-line-strong px-4 text-sm font-semibold text-ad-body transition-colors hover:bg-ad-sunken"
                                >
                                    <Icon name="swap_vert" className="text-[19px]" />
                                    <span className="hidden sm:inline">Sırala</span>
                                </button>
                            )}
                            <NewButton href={`${base}/yeni`} label={catalog.singular + " Ekle"} />
                        </div>
                    )
                }
            />

            {failed ? (
                <EmptyState
                    icon="cloud_off"
                    title="Veriler yüklenemedi"
                    text="Sunucuya ulaşılamıyor, sayfayı yenileyin."
                />
            ) : ordering ? (
                <OrderEditor
                    rows={sorted}
                    renderItem={orderItem}
                    onSave={saveOrder}
                    onCancel={() => setOrdering(false)}
                />
            ) : (
                <DataList
                    rows={sorted}
                    columns={columns}
                    empty={
                        <EmptyState
                            icon={catalog.icon}
                            title="Henüz kayıt yok"
                            text={`İlk ${catalog.singular.toLocaleLowerCase("tr")} kaydını ekleyerek başlayın.`}
                        >
                            <div className="mt-2">
                                <NewButton href={`${base}/yeni`} label={catalog.singular + " Ekle"} />
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
                message="Kayıt geri getirilemez. Bu kataloğu kullanan ürünler varsa silme işlemi reddedilebilir."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}