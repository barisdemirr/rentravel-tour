"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, NewButton, PageHeader, StatusBadge } from "@/components/admin/DataList";
import OrderEditor from "@/components/admin/OrderEditor";
import { useToast } from "@/components/admin/Toast";
import { adminDelete, adminGet, adminPut } from "@/lib/admin/client";
import { sortByOrder } from "@/lib/admin/reorder";

const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function StaticPagesClient({ rows, failed }) {
    const router = useRouter();
    const toast = useToast();
    const sorted = useMemo(() => sortByOrder(rows), [rows]);

    const [target, setTarget] = useState(null);
    const [ordering, setOrdering] = useState(false);

    const remove = async () => {
        try {
            await adminDelete(`/admin/static-pages/${target.id}`);
            toast.success(`"${target.title?.tr}" silindi.`);
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    /** Liste içeriği taşımıyor, sırayı kaydetmek için tam kaydı çekiyoruz */
    const saveOrder = async (diff) => {
        for (const row of diff) {
            const full = await adminGet(`/admin/static-pages/${row.id}`);
            await adminPut(`/admin/static-pages/${row.id}`, {
                slug: full.slug,
                title: full.title,
                content: full.content,
                seoTitle: full.seoTitle,
                seoDescription: full.seoDescription,
                orderIndex: row.orderIndex,
                isActive: full.isActive,
            });
        }
        router.refresh();
    };

    const columns = [
        {
            key: "page",
            header: "Sayfa",
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ad-brand-soft text-ad-brand">
                        <Icon name="description" className="text-[20px]" />
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{row.title?.tr}</div>
                        <code dir="ltr" className="text-xs text-ad-faint">
                            /{row.slug}
                        </code>
                    </div>
                </div>
            ),
        },
        {
            key: "updated",
            header: "Son Güncelleme",
            hideOnMobile: true,
            className: "w-40",
            render: (row) => <span className="text-sm text-ad-muted">{fmtDate(row.updatedAt)}</span>,
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title="Statik Sayfalar"
                description="Gizlilik politikası, kullanım şartları gibi içerik sayfaları. Alt menüde listelenir."
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
                            <NewButton href="/admin/sayfalar/yeni" label="Sayfa Ekle" />
                        </div>
                    )
                }
            />

            {failed ? (
                <EmptyState icon="cloud_off" title="Veriler yüklenemedi" text="Sunucuya ulaşılamıyor." />
            ) : ordering ? (
                <OrderEditor
                    rows={sorted}
                    renderItem={(row) => <span className="truncate text-sm font-semibold">{row.title?.tr}</span>}
                    onSave={saveOrder}
                    onCancel={() => setOrdering(false)}
                />
            ) : (
                <DataList
                    rows={sorted}
                    columns={columns}
                    empty={
                        <EmptyState icon="description" title="Sayfa yok" text="İlk içerik sayfasını ekleyin.">
                            <div className="mt-2">
                                <NewButton href="/admin/sayfalar/yeni" label="Sayfa Ekle" />
                            </div>
                        </EmptyState>
                    }
                    actions={(row) => [
                        { label: "Düzenle", icon: "edit", href: `/admin/sayfalar/${row.id}` },
                        { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                    ]}
                />
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title={`"${target?.title?.tr ?? ""}" silinsin mi?`}
                message="Sayfa siteden kaldırılır ve adresi 404 verir."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}