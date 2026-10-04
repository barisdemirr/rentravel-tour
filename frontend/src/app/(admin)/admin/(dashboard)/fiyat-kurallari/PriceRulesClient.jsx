"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, PageHeader, StatusBadge } from "@/components/admin/DataList";
import FormDialog from "@/components/admin/FormDialog";
import OwnerPicker from "@/components/admin/OwnerPicker";
import { useToast } from "@/components/admin/Toast";
import LocalizedField, { cleanLocalized, emptyLocalized, toLocalized } from "@/components/admin/LocalizedField";
import { DateInput, Field, NumberInput, Switch } from "@/components/admin/fields";
import { adminDelete, adminPost, adminPut } from "@/lib/admin/client";

const fmtDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
const money = (amount, currency) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY" }).format(amount ?? 0);

/** Tarih aralıkları çakışıyor mu (uyarı amaçlı, backend öncelikle çözüyor) */
function overlaps(rule, others) {
    return others.some(
        (o) => o.id !== rule.id && o.isActive && rule.startDate <= o.endDate && o.startDate <= rule.endDate
    );
}

const emptyForm = () => ({
    startDate: "",
    endDate: "",
    price: "",
    priority: 0,
    label: emptyLocalized(),
    isActive: true,
});

export default function PriceRulesClient({ groups, ownerType, ownerId, ownerLabel, currency, rules }) {
    const router = useRouter();
    const toast = useToast();

    const [editing, setEditing] = useState(null); // null | "new" | kayıt
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const openNew = () => {
        setForm(emptyForm());
        setErrors({});
        setEditing("new");
    };

    const openEdit = (rule) => {
        setForm({
            startDate: rule.startDate,
            endDate: rule.endDate,
            price: rule.price,
            priority: rule.priority,
            label: toLocalized(rule.label),
            isActive: rule.isActive,
        });
        setErrors({});
        setEditing(rule);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const input = {
            startDate: form.startDate || null,
            endDate: form.endDate || null,
            price: Number(form.price) || 0,
            priority: Number(form.priority) || 0,
            label: cleanLocalized(form.label),
            isActive: form.isActive,
        };

        try {
            if (editing === "new") {
                await adminPost("/admin/price-rules", { ...input, ownerType, ownerId });
            } else {
                await adminPut(`/admin/price-rules/${editing.id}`, input);
            }

            toast.success(editing === "new" ? "Fiyat kuralı eklendi." : "Kural güncellendi.");
            setEditing(null);
            router.refresh();
        } catch (e) {
            if (e.errors) {
                setErrors(e.errors);
                toast.error("Formda eksik veya hatalı alanlar var.");
            } else {
                toast.error(e.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        try {
            await adminDelete(`/admin/price-rules/${target.id}`);
            toast.success("Kural silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const columns = [
        {
            key: "period",
            header: "Dönem",
            primary: true,
            render: (row) => (
                <div className="min-w-0">
                    <div dir="ltr" className="text-sm font-semibold">
                        {fmtDate(row.startDate)} — {fmtDate(row.endDate)}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                        {row.label?.tr && <span className="truncate text-xs text-ad-muted">{row.label.tr}</span>}
                        {overlaps(row, rules) && (
                            <span
                                title="Bu dönem başka bir kuralla çakışıyor, yüksek öncelikli olan uygulanır"
                                className="inline-flex items-center gap-1 rounded-full bg-ad-warn-soft px-2 py-0.5 text-[11px] font-bold text-ad-warn"
                            >
                                <Icon name="warning" className="text-[12px]" />
                                Çakışma
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "price",
            header: "Fiyat",
            className: "w-36",
            render: (row) => <span className="font-semibold">{money(row.price, currency)}</span>,
        },
        {
            key: "priority",
            header: "Öncelik",
            hideOnMobile: true,
            className: "w-24",
            render: (row) => row.priority,
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title="Dönemsel Fiyatlar"
                description="Belirli tarih aralıklarında geçerli fiyatlar. Araçlarda günlük, bungalovlarda gecelik, turlarda kişi başı tutar."
                action={
                    ownerId ? (
                        <button
                            type="button"
                            onClick={openNew}
                            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110"
                        >
                            <Icon name="add" className="text-[19px]" />
                            Dönem Ekle
                        </button>
                    ) : null
                }
            />

            <OwnerPicker
                groups={groups}
                typeParam="ownerType"
                idParam="ownerId"
                type={ownerType}
                id={ownerId}
            />

            {!ownerId ? (
                <EmptyState
                    icon="touch_app"
                    title="Kayıt seçin"
                    text="Fiyat kurallarını görmek için yukarıdan bir araç, tur veya bungalov seçin."
                />
            ) : (
                <>
                    <p className="mb-4 flex items-start gap-2 rounded-xl bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                        <Icon name="lightbulb" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                        <span>
                            Bir tarih birden fazla döneme giriyorsa <strong className="text-ad-body">önceliği
                                yüksek</strong> olan uygulanır. Kural bulunmayan tarihlerde kayıttaki temel fiyat
                            kullanılır.
                        </span>
                    </p>

                    <DataList
                        rows={rules}
                        columns={columns}
                        empty={
                            <EmptyState
                                icon="date_range"
                                title="Dönemsel fiyat yok"
                                text={`"${ownerLabel}" için tüm tarihlerde temel fiyat geçerli.`}
                            >
                                <button
                                    type="button"
                                    onClick={openNew}
                                    className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125"
                                >
                                    <Icon name="add" className="text-[18px]" />
                                    Dönem Ekle
                                </button>
                            </EmptyState>
                        }
                        actions={(row) => [
                            { label: "Düzenle", icon: "edit", onClick: () => openEdit(row) },
                            { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                        ]}
                    />
                </>
            )}

            <FormDialog
                open={Boolean(editing)}
                title={editing === "new" ? "Yeni Dönem" : "Dönemi Düzenle"}
                description={ownerLabel}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
                saveLabel={editing === "new" ? "Ekle" : "Kaydet"}
            >
                <Field label="Başlangıç" required error={fieldError("startDate")}>
                    <DateInput
                        required
                        value={form.startDate}
                        error={fieldError("startDate")}
                        onChange={(e) => {
                            const v = e.target.value;
                            setForm((f) => ({ ...f, startDate: v, endDate: f.endDate < v ? v : f.endDate }));
                        }}
                    />
                </Field>

                <Field label="Bitiş" required hint="Bu tarih dahil" error={fieldError("endDate")}>
                    <DateInput
                        required
                        min={form.startDate || undefined}
                        value={form.endDate}
                        error={fieldError("endDate")}
                        onChange={(e) => set("endDate")(e.target.value)}
                    />
                </Field>

                <Field label="Fiyat" required error={fieldError("price")}>
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.price}
                        error={fieldError("price")}
                        onChange={(e) => set("price")(e.target.value)}
                    />
                </Field>

                <Field
                    label="Öncelik"
                    hint="Çakışmada yüksek kazanır, 0 => en yüksek öncelik"
                    error={fieldError("priority")}
                >
                    <NumberInput
                        step="1"
                        value={form.priority}
                        error={fieldError("priority")}
                        onChange={(e) => set("priority")(e.target.value)}
                    />
                </Field>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="label"
                        label="Dönem Adı"
                        hint="Müşteriye fiyat dökümünde gösterilir: Yaz sezonu, bayram dönemi"
                        maxLength={60}
                        value={form.label}
                        onChange={set("label")}
                        errors={Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]))}
                    />
                </div>

                <div className="sm:col-span-2">
                    <Switch
                        label="Etkin"
                        hint="Kapalıyken bu dönem fiyat hesabına girmez"
                        checked={form.isActive}
                        onChange={set("isActive")}
                    />
                </div>
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title="Dönem silinsin mi?"
                message={`${fmtDate(target?.startDate)} — ${fmtDate(target?.endDate)} aralığındaki fiyat kuralı kaldırılır.`}
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}