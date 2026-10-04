"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, PageHeader, StatusBadge } from "@/components/admin/DataList";
import FormDialog from "@/components/admin/FormDialog";
import OrderEditor from "@/components/admin/OrderEditor";
import { useToast } from "@/components/admin/Toast";
import { Field, NumberInput, SelectInput, Switch, TextInput } from "@/components/admin/fields";
import { adminDelete, adminPost, adminPut } from "@/lib/admin/client";
import { nextIndex, sortByOrder } from "@/lib/admin/reorder";

const LANGS = [
    { value: "TR", label: "Türkçe" },
    { value: "EN", label: "İngilizce" },
    { value: "AR", label: "Arapça" },
    { value: "DE", label: "Almanca" },
    { value: "UK", label: "Ukraynaca" },
    { value: "RU", label: "Rusça" },
];

const emptyForm = (order) => ({
    name: "",
    initials: "",
    lang: "TR",
    text: "",
    rating: 5,
    orderIndex: order,
    isActive: true,
});

const toPayload = (row) => ({
    name: row.name,
    initials: row.initials,
    lang: row.lang,
    text: row.text,
    rating: row.rating,
    orderIndex: row.orderIndex,
    isActive: row.isActive,
});

export default function TestimonialsClient({ rows, failed }) {
    const router = useRouter();
    const toast = useToast();

    const sorted = useMemo(() => sortByOrder(rows), [rows]);

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(() => emptyForm(0));
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);
    const [ordering, setOrdering] = useState(false);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const openNew = () => {
        setForm(emptyForm(nextIndex(rows)));
        setErrors({});
        setEditing("new");
    };

    const openEdit = (row) => {
        setForm({ ...toPayload(row), rating: row.rating ?? "" });
        setErrors({});
        setEditing(row);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const input = {
            name: form.name.trim(),
            // Boş bırakılırsa backend addan üretiyor
            initials: form.initials.trim() || null,
            lang: form.lang,
            text: form.text.trim(),
            rating: form.rating === "" ? null : Number(form.rating),
            orderIndex: Number(form.orderIndex) || 0,
            isActive: form.isActive,
        };

        try {
            if (editing === "new") await adminPost("/admin/testimonials", input);
            else await adminPut(`/admin/testimonials/${editing.id}`, input);

            toast.success(editing === "new" ? "Yorum eklendi." : "Yorum güncellendi.");
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
            await adminDelete(`/admin/testimonials/${target.id}`);
            toast.success("Yorum silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const saveOrder = async (diff) => {
        for (const row of diff) {
            await adminPut(`/admin/testimonials/${row.id}`, { ...toPayload(row), orderIndex: row.orderIndex });
        }
        router.refresh();
    };

    const columns = [
        {
            key: "person",
            header: "Yorum",
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ad-brand-soft text-xs font-bold text-ad-brand">
                        {row.initials}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">{row.name}</span>
                            <span className="shrink-0 rounded bg-ad-sunken px-1.5 py-0.5 text-[10px] font-bold text-ad-muted">
                                {row.lang}
                            </span>
                        </div>
                        <p dir={row.dir} className="mt-0.5 line-clamp-2 text-xs text-ad-muted">
                            {row.text}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "rating",
            header: "Puan",
            className: "w-24",
            render: (row) =>
                row.rating ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <Icon name="star" fill className="text-[15px] text-ad-warn" />
                        {row.rating}
                    </span>
                ) : (
                    <span className="text-xs text-ad-faint">—</span>
                ),
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title="Müşteri Yorumları"
                description="Ana sayfadaki yorum şeridinde gösterilir. Arapça yorumlar otomatik sağdan sola hizalanır."
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
                            <button
                                type="button"
                                onClick={openNew}
                                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110"
                            >
                                <Icon name="add" className="text-[19px]" />
                                Yorum Ekle
                            </button>
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
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ad-brand-soft text-[11px] font-bold text-ad-brand">
                                {row.initials}
                            </span>
                            <span className="truncate text-sm font-semibold">{row.name}</span>
                        </div>
                    )}
                    onSave={saveOrder}
                    onCancel={() => setOrdering(false)}
                />
            ) : (
                <DataList
                    rows={sorted}
                    columns={columns}
                    empty={
                        <EmptyState icon="reviews" title="Yorum yok" text="İlk müşteri yorumunu ekleyin.">
                            <button
                                type="button"
                                onClick={openNew}
                                className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125"
                            >
                                <Icon name="add" className="text-[18px]" />
                                Yorum Ekle
                            </button>
                        </EmptyState>
                    }
                    actions={(row) => [
                        { label: "Düzenle", icon: "edit", onClick: () => openEdit(row) },
                        { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                    ]}
                />
            )}

            <FormDialog
                open={Boolean(editing)}
                title={editing === "new" ? "Yeni Yorum" : "Yorumu Düzenle"}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
                saveLabel={editing === "new" ? "Ekle" : "Kaydet"}
            >
                <Field label="Ad Soyad" required error={fieldError("name")}>
                    <TextInput
                        required
                        value={form.name}
                        error={fieldError("name")}
                        onChange={(e) => set("name")(e.target.value)}
                    />
                </Field>

                <Field label="Baş Harfler" hint="Boş bırakılırsa addan üretilir" error={fieldError("initials")}>
                    <TextInput
                        maxLength={5}
                        placeholder="HM"
                        value={form.initials}
                        error={fieldError("initials")}
                        onChange={(e) => set("initials")(e.target.value.toLocaleUpperCase("tr"))}
                    />
                </Field>

                <Field label="Yorum Dili" required error={fieldError("lang")}>
                    <SelectInput value={form.lang} onChange={(e) => set("lang")(e.target.value)}>
                        {LANGS.map((l) => (
                            <option key={l.value} value={l.value}>
                                {l.label}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <Field label="Puan" hint="Boş bırakılırsa gösterilmez" error={fieldError("rating")}>
                    <NumberInput
                        min="1"
                        max="5"
                        step="1"
                        value={form.rating}
                        error={fieldError("rating")}
                        onChange={(e) => set("rating")(e.target.value)}
                    />
                </Field>

                <div className="sm:col-span-2">
                    <Field label="Yorum Metni" required error={fieldError("text")}>
                        <TextInput
                            as="textarea"
                            rows={5}
                            required
                            maxLength={2000}
                            dir={form.lang === "AR" ? "rtl" : "ltr"}
                            value={form.text}
                            error={fieldError("text")}
                            onChange={(e) => set("text")(e.target.value)}
                        />
                    </Field>
                </div>

                <div className="sm:col-span-2">
                    <Switch
                        label="Yayında"
                        hint="Kapalıyken ana sayfada görünmez"
                        checked={form.isActive}
                        onChange={set("isActive")}
                    />
                </div>
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title={`"${target?.name ?? ""}" yorumu silinsin mi?`}
                message="Yorum geri getirilemez."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}