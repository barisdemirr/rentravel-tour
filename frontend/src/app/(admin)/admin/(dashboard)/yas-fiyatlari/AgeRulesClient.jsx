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
import { Field, NumberInput, SelectInput, Switch } from "@/components/admin/fields";
import { adminDelete, adminPost, adminPut } from "@/lib/admin/client";

const money = (amount, currency) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY" }).format(amount ?? 0);

const emptyForm = () => ({
    minAge: 0,
    maxAge: 11,
    type: "Fixed",
    price: "",
    percentage: "",
    label: emptyLocalized(),
    isActive: true,
});

/** Yaş aralıkları çakışıyor mu */
function overlaps(rule, others) {
    return others.some((o) => o.id !== rule.id && o.isActive && rule.minAge <= o.maxAge && o.minAge <= rule.maxAge);
}

export default function AgeRulesClient({ groups, ownerType, ownerId, ownerLabel, currency, rules }) {
    const router = useRouter();
    const toast = useToast();

    const isBungalow = ownerType === "Bungalow";

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const openNew = () => {
        setForm({ ...emptyForm(), type: isBungalow ? "Fixed" : "Percentage" });
        setErrors({});
        setEditing("new");
    };

    const openEdit = (rule) => {
        setForm({
            minAge: rule.minAge,
            maxAge: rule.maxAge,
            type: rule.type,
            price: rule.price ?? "",
            percentage: rule.percentage ?? "",
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
            minAge: Number(form.minAge) || 0,
            maxAge: Number(form.maxAge) || 0,
            type: form.type,
            // Tipe göre yalnızca ilgili alan gönderilir
            price: form.type === "Fixed" ? Number(form.price) || 0 : null,
            percentage: form.type === "Percentage" ? Number(form.percentage) || 0 : null,
            label: cleanLocalized(form.label),
            isActive: form.isActive,
        };

        try {
            if (editing === "new") {
                await adminPost("/admin/age-price-rules", { ...input, ownerType, ownerId });
            } else {
                await adminPut(`/admin/age-price-rules/${editing.id}`, input);
            }

            toast.success(editing === "new" ? "Yaş fiyatı eklendi." : "Yaş fiyatı güncellendi.");
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
            await adminDelete(`/admin/age-price-rules/${target.id}`);
            toast.success("Yaş fiyatı silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const describe = (row) => {
        if (row.type === "Free") return "Ücretsiz";
        if (row.type === "Percentage") return `%${row.percentage} indirim`;
        return isBungalow ? `${money(row.price, currency)} / gece` : money(row.price, currency);
    };

    const columns = [
        {
            key: "age",
            header: "Yaş Aralığı",
            primary: true,
            render: (row) => (
                <div className="min-w-0">
                    <div className="text-sm font-semibold">
                        {row.minAge} – {row.maxAge} yaş
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5">
                        {row.label?.tr && <span className="truncate text-xs text-ad-muted">{row.label.tr}</span>}
                        {overlaps(row, rules) && (
                            <span
                                title="Bu yaş aralığı başka bir kuralla çakışıyor"
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
            header: "Ücret",
            className: "w-40",
            render: (row) => (
                <span
                    className={`font-semibold ${row.type === "Free" ? "text-ad-ok" : ""}`}
                >
                    {describe(row)}
                </span>
            ),
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title="Yaş Fiyatları"
                description="Çocuk ücretleri. Kural bulunmayan yaşlar yetişkin fiyatından hesaplanır."
                action={
                    ownerId ? (
                        <button
                            type="button"
                            onClick={openNew}
                            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110"
                        >
                            <Icon name="add" className="text-[19px]" />
                            Yaş Aralığı Ekle
                        </button>
                    ) : null
                }
            />

            <OwnerPicker groups={groups} typeParam="ownerType" idParam="ownerId" type={ownerType} id={ownerId} />

            {!ownerId ? (
                <EmptyState
                    icon="touch_app"
                    title="Kayıt seçin"
                    text="Çocuk fiyatlarını görmek için yukarıdan bir tur veya bungalov seçin."
                />
            ) : (
                <>
                    <p className="mb-4 flex items-start gap-2 rounded-xl bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                        <Icon name="lightbulb" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                        <span>
                            {isBungalow ? (
                                <>
                                    Bungalovlarda çocuk ücreti{" "}
                                    <strong className="text-ad-body">gece başına ek tutar</strong> olarak eklenir.
                                    Yüzde indirim kullanılamaz.
                                </>
                            ) : (
                                <>
                                    Turlarda çocuk ücreti yetişkin fiyatı üzerinden hesaplanır. 18 yaş ve üzeri her
                                    zaman yetişkin sayılır.
                                </>
                            )}
                        </span>
                    </p>

                    <DataList
                        rows={rules}
                        columns={columns}
                        empty={
                            <EmptyState
                                icon="child_care"
                                title="Yaş fiyatı yok"
                                text={`"${ownerLabel}" için tüm çocuklar yetişkin fiyatından hesaplanıyor.`}
                            >
                                <button
                                    type="button"
                                    onClick={openNew}
                                    className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125"
                                >
                                    <Icon name="add" className="text-[18px]" />
                                    Yaş Aralığı Ekle
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
                title={editing === "new" ? "Yeni Yaş Aralığı" : "Yaş Aralığını Düzenle"}
                description={ownerLabel}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
                saveLabel={editing === "new" ? "Ekle" : "Kaydet"}
            >
                <Field label="En Küçük Yaş" required error={fieldError("minAge")}>
                    <NumberInput
                        min="0"
                        max="17"
                        step="1"
                        suffix="yaş"
                        value={form.minAge}
                        error={fieldError("minAge")}
                        onChange={(e) => set("minAge")(e.target.value)}
                    />
                </Field>

                <Field label="En Büyük Yaş" required hint="Bu yaş dahil" error={fieldError("maxAge")}>
                    <NumberInput
                        min="0"
                        max="17"
                        step="1"
                        suffix="yaş"
                        value={form.maxAge}
                        error={fieldError("maxAge")}
                        onChange={(e) => set("maxAge")(e.target.value)}
                    />
                </Field>

                <Field label="Ücretlendirme" required error={fieldError("type")}>
                    <SelectInput value={form.type} onChange={(e) => set("type")(e.target.value)}>
                        <option value="Fixed">Sabit tutar</option>
                        {!isBungalow && <option value="Percentage">Yüzde indirim</option>}
                        <option value="Free">Ücretsiz</option>
                    </SelectInput>
                </Field>

                {form.type === "Fixed" && (
                    <Field
                        label={isBungalow ? "Gecelik Tutar" : "Kişi Başı Tutar"}
                        required
                        error={fieldError("price")}
                    >
                        <NumberInput
                            min="0"
                            step="0.01"
                            value={form.price}
                            error={fieldError("price")}
                            onChange={(e) => set("price")(e.target.value)}
                        />
                    </Field>
                )}

                {form.type === "Percentage" && (
                    <Field
                        label="İndirim Oranı"
                        required
                        hint="Yetişkin fiyatından düşülür"
                        error={fieldError("percentage")}
                    >
                        <NumberInput
                            min="0"
                            max="100"
                            step="1"
                            suffix="%"
                            value={form.percentage}
                            error={fieldError("percentage")}
                            onChange={(e) => set("percentage")(e.target.value)}
                        />
                    </Field>
                )}

                {form.type === "Free" && (
                    <div className="flex items-end">
                        <p className="rounded-xl bg-ad-ok-soft px-3.5 py-3 text-xs font-semibold text-ad-ok">
                            Bu yaş aralığı ücretsiz olacak.
                        </p>
                    </div>
                )}

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="label"
                        label="Açıklama"
                        hint="Fiyat dökümünde çocuk satırının altında görünür: 0-2 yaş ücretsiz"
                        maxLength={60}
                        value={form.label}
                        onChange={set("label")}
                        errors={Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]))}
                    />
                </div>

                <div className="sm:col-span-2">
                    <Switch
                        label="Etkin"
                        hint="Kapalıyken bu yaş aralığı hesaba girmez"
                        checked={form.isActive}
                        onChange={set("isActive")}
                    />
                </div>
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title="Yaş aralığı silinsin mi?"
                message={`${target?.minAge} – ${target?.maxAge} yaş kuralı kaldırılır, bu yaştaki çocuklar yetişkin fiyatından hesaplanır.`}
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}