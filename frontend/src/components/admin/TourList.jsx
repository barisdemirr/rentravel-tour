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
import { tourToInput } from "@/lib/admin/tours";
import { mediaUrl } from "@/lib/media";

const money = (amount, currency) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY", maximumFractionDigits: 0 }).format(
        amount ?? 0
    );

export default function TourList({ variant, rows, failed }) {
    const router = useRouter();
    const toast = useToast();
    const [target, setTarget] = useState(null);
    const [ordering, setOrdering] = useState(false);
    const [query, setQuery] = useState("");

    const isCulture = variant === "culture";
    const api = isCulture ? "culture-tours" : "daily-tours";
    const base = isCulture ? "/admin/kultur-turlari" : "/admin/gunubirlik-turlar";
    const owner = isCulture ? "CultureTour" : "DailyTour";
    const label = isCulture ? "Kültür Turu" : "Günübirlik Tur";

    const sorted = useMemo(() => sortByOrder(rows), [rows]);
    const visible = useMemo(() => {
        const q = query.trim().toLocaleLowerCase("tr");
        if (!q) return sorted;
        return sorted.filter((t) =>
            [t.title?.tr, t.slug, t.category?.label?.tr].join(" ").toLocaleLowerCase("tr").includes(q)
        );
    }, [sorted, query]);

    const remove = async () => {
        try {
            await adminDelete(`/admin/${api}/${target.id}`);
            toast.success(`"${target.title?.tr}" silindi.`);
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    /** Tur gövdesi büyük: tam kaydı çek, sadece sırayı değiştir */
    const saveOrder = async (diff) => {
        for (const row of diff) {
            const full = await adminGet(`/admin/${api}/${row.id}`);
            await adminPut(`/admin/${api}/${row.id}`, { ...tourToInput(full, variant), orderIndex: row.orderIndex });
        }
        router.refresh();
    };

    const columns = [
        {
            key: "tour",
            header: label,
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-ad-sunken">
                        {row.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={mediaUrl(row.image, "thumb")} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-ad-faint">
                                <Icon name={isCulture ? "castle" : "hiking"} className="text-[20px]" />
                            </span>
                        )}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">{row.title?.tr}</span>
                            {row.isFeatured && (
                                <Icon name="star" fill className="shrink-0 text-[15px] text-ad-warn" title="Öne çıkan" />
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
            key: "category",
            header: "Kategori",
            render: (row) =>
                row.category ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ad-sunken px-2.5 py-1 text-xs font-semibold">
                        <Icon name={row.category.icon} className="text-[14px] text-ad-brand" />
                        {row.category.label?.tr}
                    </span>
                ) : (
                    <span className="text-xs text-ad-faint">Atanmamış</span>
                ),
        },
        ...(isCulture
            ? [{ key: "nights", header: "Süre", className: "w-24", render: (row) => `${row.nights ?? 0} gece` }]
            : []),
        {
            key: "price",
            header: isCulture ? "Taban Fiyat" : "Kişi Başı",
            className: "w-32",
            render: (row) => <span className="font-semibold">{money(row.defaultBasePrice, row.currency)}</span>,
        },
        { key: "seats", header: "Kontenjan", hideOnMobile: true, className: "w-24", render: (row) => row.seatsTotal ?? 0 },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title={isCulture ? "Kültür Turları" : "Günübirlik Turlar"}
                description={
                    isCulture
                        ? "Konaklamalı turlar. Fiyat yalnızca konaklama tipi üzerinden belirlenir."
                        : "Tek günlük turlar. Sezon fiyatları ve seferler ayrı sayfalardan yönetilir."
                }
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
                            <NewButton href={`${base}/yeni`} label={`${label} Ekle`} />
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
                                    <img src={mediaUrl(row.image, "thumb")} alt="" className="h-full w-full object-cover" />
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
                                placeholder="Tur adı, adres veya kategori ara"
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
                                icon={isCulture ? "castle" : "hiking"}
                                title={query ? "Aramaya uygun tur yok" : "Henüz tur eklenmemiş"}
                                text={query ? "Farklı bir arama deneyin." : "İlk turu ekleyerek başlayın."}
                            >
                                {!query && (
                                    <div className="mt-2">
                                        <NewButton href={`${base}/yeni`} label={`${label} Ekle`} />
                                    </div>
                                )}
                            </EmptyState>
                        }
                        actions={(row) => [
                            ...(isCulture
                                ? [
                                    {
                                        label: "Konaklama fiyatları",
                                        icon: "hotel",
                                        href: `/admin/kultur-turlari/${row.id}/konaklama-fiyatlari`,
                                    },
                                ]
                                : [
                                    {
                                        label: "Fiyatlar",
                                        icon: "payments",
                                        href: `/admin/fiyat-kurallari?ownerType=DailyTour&ownerId=${row.id}`,
                                    },
                                ]),
                            {
                                label: "Yaş fiyatları",
                                icon: "child_care",
                                href: `/admin/yas-fiyatlari?ownerType=${owner}&ownerId=${row.id}`,
                            },
                            {
                                label: "Seferler",
                                icon: "event",
                                href: `/admin/tur-seferleri?tourType=${isCulture ? "Culture" : "Daily"}&tourId=${row.id}`,
                            },
                            { label: "Düzenle", icon: "edit", href: `${base}/${row.id}` },
                            { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                        ]}
                    />
                </>
            )}

            <ConfirmDialog
                open={Boolean(target)}
                title={`"${target?.title?.tr ?? ""}" silinsin mi?`}
                message="Tur siteden kaldırılır ve geri getirilemez. Tanımlı seferler ve fiyatlar da erişilemez hale gelir."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}