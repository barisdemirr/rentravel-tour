"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, PageHeader, StatusBadge } from "@/components/admin/DataList";
import FormDialog from "@/components/admin/FormDialog";
import { useToast } from "@/components/admin/Toast";
import { Field, NumberInput, SelectInput, Switch } from "@/components/admin/fields";
import { adminDelete, adminPost, adminPut } from "@/lib/admin/client";

const money = (amount, currency) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY" }).format(amount ?? 0);

export default function AccommodationPricesClient({ tour, prices, types }) {
    const router = useRouter();
    const toast = useToast();

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ accommodationTypeId: "", pricePerPerson: "", isActive: true });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);

    /* Fiyatı girilmemiş tipler: eksik kalmasın diye ayrıca gösteriliyor */
    const missing = useMemo(() => {
        const used = new Set(prices.map((p) => p.accommodationType?.id));
        return types.filter((t) => t.isActive && !used.has(t.id));
    }, [prices, types]);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const openNew = (typeId = "") => {
        setForm({ accommodationTypeId: typeId, pricePerPerson: "", isActive: true });
        setErrors({});
        setEditing("new");
    };

    const openEdit = (price) => {
        setForm({
            accommodationTypeId: price.accommodationType?.id ?? "",
            pricePerPerson: price.pricePerPerson,
            isActive: price.isActive,
        });
        setErrors({});
        setEditing(price);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const input = {
            accommodationTypeId: form.accommodationTypeId,
            pricePerPerson: Number(form.pricePerPerson) || 0,
            isActive: form.isActive,
        };

        try {
            if (editing === "new") {
                await adminPost(`/admin/culture-tours/${tour.id}/accommodation-prices`, input);
            } else {
                await adminPut(`/admin/accommodation-prices/${editing.id}`, input);
            }

            toast.success(editing === "new" ? "Konaklama fiyatı eklendi." : "Fiyat güncellendi.");
            setEditing(null);
            router.refresh();
        } catch (e) {
            if (e.errors) {
                setErrors(e.errors);
                toast.error("Formda eksik veya hatalı alanlar var.");
            } else {
                // 409: bu tip için fiyat zaten var
                toast.error(e.messages?.() ?? e.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        try {
            await adminDelete(`/admin/accommodation-prices/${target.id}`);
            toast.success("Fiyat silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const columns = [
        {
            key: "type",
            header: "Konaklama Tipi",
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ad-brand-soft text-ad-brand">
                        <Icon name={row.accommodationType?.icon || "hotel"} className="text-[20px]" />
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                            {row.accommodationType?.label?.tr ?? "Silinmiş tip"}
                        </div>
                        <code dir="ltr" className="text-xs text-ad-faint">
                            {row.accommodationType?.key}
                        </code>
                    </div>
                </div>
            ),
        },
        {
            key: "price",
            header: "Kişi Başı",
            className: "w-40",
            render: (row) => <span className="font-semibold">{money(row.pricePerPerson, tour.currency)}</span>,
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    const activePrices = prices.filter((p) => p.isActive).length;

    return (
        <div className="mx-auto w-full max-w-5xl">
            <div className="mb-5 flex items-start gap-3">
                <Link
                    href="/admin/kultur-turlari"
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px] rtl:-scale-x-100" />
                </Link>
                <div className="min-w-0 flex-1">
                    <PageHeader
                        title="Konaklama Fiyatları"
                        description={`${tour.title?.tr} · ${tour.nights} gece`}
                        action={
                            <button
                                type="button"
                                onClick={() => openNew()}
                                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110"
                            >
                                <Icon name="add" className="text-[19px]" />
                                Fiyat Ekle
                            </button>
                        }
                    />
                </div>
            </div>

            {/* Uyarı: hiç etkin fiyat yoksa tur satılamaz */}
            {activePrices === 0 && (
                <p className="mb-4 flex items-start gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 py-3 text-sm text-ad-brand-dark">
                    <Icon name="error" className="mt-px shrink-0 text-[18px]" />
                    <span>
                        Bu tur için etkin konaklama fiyatı yok. Müşteri fiyat göremez ve rezervasyon yapamaz.
                    </span>
                </p>
            )}

            <p className="mb-4 flex items-start gap-2 rounded-xl bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                <Icon name="lightbulb" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                <span>
                    Kültür turlarında misafir fiyatı <strong className="text-ad-body">yalnızca buradaki tutarlardan</strong>{" "}
                    hesaplanır. Turdaki taban fiyat ve dönemsel fiyatlar kullanılmaz. Tutar, tüm konaklama süresi için
                    kişi başı toplam ücrettir.
                </span>
            </p>

            <DataList
                rows={prices}
                columns={columns}
                empty={
                    <EmptyState
                        icon="hotel"
                        title="Konaklama fiyatı yok"
                        text="Her konaklama tipi için kişi başı ücret girin."
                    >
                        <button
                            type="button"
                            onClick={() => openNew()}
                            className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125"
                        >
                            <Icon name="add" className="text-[18px]" />
                            Fiyat Ekle
                        </button>
                    </EmptyState>
                }
                actions={(row) => [
                    { label: "Düzenle", icon: "edit", onClick: () => openEdit(row) },
                    { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                ]}
            />

            {/* Fiyatı girilmemiş tipler */}
            {missing.length > 0 && (
                <div className="mt-6">
                    <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ad-faint">
                        Fiyatı girilmemiş tipler
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => openNew(type.id)}
                                className="flex items-center gap-2 rounded-xl border border-dashed border-ad-line-strong bg-ad-surface px-3.5 py-2.5 text-sm font-semibold text-ad-body transition-colors hover:border-ad-brand hover:bg-ad-brand-soft hover:text-ad-brand"
                            >
                                <Icon name={type.icon || "hotel"} className="text-[18px]" />
                                {type.label?.tr}
                                <Icon name="add" className="text-[16px]" />
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 px-1 text-xs text-ad-muted">
                        Bu tipler müşteriye gösterilmez. Fiyat girerseniz seçilebilir hale gelir.
                    </p>
                </div>
            )}

            <FormDialog
                open={Boolean(editing)}
                title={editing === "new" ? "Yeni Konaklama Fiyatı" : "Fiyatı Düzenle"}
                description={tour.title?.tr}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
                saveLabel={editing === "new" ? "Ekle" : "Kaydet"}
            >
                <Field label="Konaklama Tipi" required error={fieldError("accommodationTypeId")}>
                    <SelectInput
                        required
                        value={form.accommodationTypeId}
                        error={fieldError("accommodationTypeId")}
                        disabled={editing !== "new"}
                        onChange={(e) => set("accommodationTypeId")(e.target.value)}
                    >
                        <option value="">Seçiniz</option>
                        {types.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.label?.tr}
                                {!t.isActive ? " (pasif)" : ""}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <Field
                    label="Kişi Başı Fiyat"
                    required
                    hint={`${tour.nights} gece dahil toplam`}
                    error={fieldError("pricePerPerson")}
                >
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.pricePerPerson}
                        error={fieldError("pricePerPerson")}
                        onChange={(e) => set("pricePerPerson")(e.target.value)}
                    />
                </Field>

                <div className="sm:col-span-2">
                    <Switch
                        label="Satışta"
                        hint="Kapalıyken müşteri bu tipi seçemez"
                        checked={form.isActive}
                        onChange={set("isActive")}
                    />
                </div>
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title="Konaklama fiyatı silinsin mi?"
                message={`"${target?.accommodationType?.label?.tr ?? ""}" seçeneği müşteriye gösterilmez.`}
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}