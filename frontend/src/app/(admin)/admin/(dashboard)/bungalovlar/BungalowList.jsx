"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, NewButton, PageHeader, StatusBadge } from "@/components/admin/DataList";
import OrderEditor from "@/components/admin/OrderEditor";
import { useToast } from "@/components/admin/Toast";
import { adminDelete, adminGet, adminPut } from "@/lib/admin/client";
import { absoluteUrl } from "@/lib/admin/media";
import { sortByOrder } from "@/lib/admin/reorder";
import { bungalowToInput } from "@/lib/admin/bungalows";

const money = (amount, currency) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY", maximumFractionDigits: 0 }).format(
        amount ?? 0
    );

export default function BungalowList({ rows, failed }) {
    const router = useRouter();
    const toast = useToast();
    const [target, setTarget] = useState(null);
    const [ordering, setOrdering] = useState(false);
    const [query, setQuery] = useState("");

    const sorted = useMemo(() => sortByOrder(rows), [rows]);
    const visible = useMemo(() => {
        const q = query.trim().toLocaleLowerCase("tr");
        if (!q) return sorted;
        return sorted.filter((b) =>
            [b.title?.tr, b.slug, b.location?.tr, b.region?.shortLabel?.tr]
                .join(" ")
                .toLocaleLowerCase("tr")
                .includes(q)
        );
    }, [sorted, query]);

    const remove = async () => {
        try {
            await adminDelete(`/admin/bungalows/${target.id}`);
            toast.success(`"${target.title?.tr}" silindi.`);
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    /** Bungalov gövdesi büyük: tam kaydı çek, sadece sırayı değiştir */
    const saveOrder = async (diff) => {
        for (const row of diff) {
            const full = await adminGet(`/admin/bungalows/${row.id}`);
            await adminPut(`/admin/bungalows/${row.id}`, { ...bungalowToInput(full), orderIndex: row.orderIndex });
        }
        router.refresh();
    };

    const columns = [
        {
            key: "bungalow",
            header: "Bungalov",
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ad-sunken">
                        {row.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={absoluteUrl(row.image.url)} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-ad-faint">
                                <Icon name="cottage" className="text-[20px]" />
                            </span>
                        )}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">{row.title?.tr}</span>
                            {row.isFeatured && (
                                <Icon name="star" fill className="shrink-0 text-[15px] text-ad-warn" title="Öne çıkan" />
                            )}
                            {row.breakfastIncluded && (
                                <Icon
                                    name="bakery_dining"
                                    className="shrink-0 text-[15px] text-ad-ok"
                                    title="Kahvaltı dahil"
                                />
                            )}
                        </div>
                        <code dir="ltr" className="block truncate text-xs text-ad-faint">
                            /{row.slug}
                        </code>
                    </div>
                </div>
            ),
        },
        {
            key: "region",
            header: "Bölge",
            render: (row) =>
                row.region ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ad-sunken px-2.5 py-1 text-xs font-semibold">
                        <Icon name="map" className="text-[14px] text-ad-brand" />
                        {row.region.shortLabel?.tr}
                    </span>
                ) : (
                    <span className="text-xs text-ad-faint">Atanmamış</span>
                ),
        },
        {
            key: "price",
            header: "Gecelik",
            className: "w-32",
            render: (row) => <span className="font-semibold">{money(row.defaultPricePerNight, row.currency)}</span>,
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title="Bungalovlar"
                description="Konaklama tesisleri. Sezon fiyatları ve çocuk ücretleri ayrı sayfalardan yönetilir."
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
                            <NewButton href="/admin/bungalovlar/yeni" label="Bungalov Ekle" />
                        </div>
                    )
                }
            />

            {failed ? (
                <EmptyState icon="cloud_off" title="Veriler yüklenemedi" text="Sunucuya ulaşılamıyor." />
            ) : ordering ? (
                <OrderEditor
                    rows={sorted}
                    renderItem={(row) => (
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span className="h-9 w-12 shrink-0 overflow-hidden rounded-md bg-ad-sunken">
                                {row.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={absoluteUrl(row.image.url)} alt="" className="h-full w-full object-cover" />
                                )}
                            </span>
                            <span className="truncate text-sm font-semibold">{row.title?.tr}</span>
                        </div>
                    )}
                    onSave={saveOrder}
                    onCancel={() => setOrdering(false)}
                />
            ) : (
                <>
                    {sorted.length > 5 && (
                        <div className="relative mb-4">
                            <Icon
                                name="search"
                                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[19px] text-ad-muted"
                            />
                            <input
                                type="search"
                                placeholder="Tesis adı, bölge veya konum ara"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="ad-field ps-10"
                            />
                        </div>
                    )}

                    <DataList
                        rows={visible}
                        columns={columns}
                        empty={
                            <EmptyState
                                icon="cottage"
                                title={query ? "Aramaya uygun bungalov yok" : "Henüz bungalov eklenmemiş"}
                                text={query ? "Farklı bir arama deneyin." : "İlk tesisi ekleyerek başlayın."}
                            >
                                {!query && (
                                    <div className="mt-2">
                                        <NewButton href="/admin/bungalovlar/yeni" label="Bungalov Ekle" />
                                    </div>
                                )}
                            </EmptyState>
                        }
                        actions={(row) => [
                            {
                                label: "Fiyatlar",
                                icon: "payments",
                                href: `/admin/fiyat-kurallari?ownerType=Bungalow&ownerId=${row.id}`,
                            },
                            {
                                label: "Çocuk ücretleri",
                                icon: "child_care",
                                href: `/admin/yas-fiyatlari?ownerType=Bungalow&ownerId=${row.id}`,
                            },
                            { label: "Düzenle", icon: "edit", href: `/admin/bungalovlar/${row.id}` },
                            { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                        ]}
                    />
                </>
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title={`"${target?.title?.tr ?? ""}" silinsin mi?`}
                message="Tesis siteden kaldırılır ve geri getirilemez. Tanımlı fiyatlar da erişilemez hale gelir."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}