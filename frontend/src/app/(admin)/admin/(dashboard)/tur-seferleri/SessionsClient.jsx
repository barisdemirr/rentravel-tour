"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, PageHeader, StatusBadge } from "@/components/admin/DataList";
import FormDialog from "@/components/admin/FormDialog";
import OwnerPicker from "@/components/admin/OwnerPicker";
import { useToast } from "@/components/admin/Toast";
import { DateInput, Field, NumberInput, Switch } from "@/components/admin/fields";
import { adminDelete, adminPost, adminPut } from "@/lib/admin/client";

const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const fmtLong = (iso) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        weekday: "short",
    });

const money = (amount, currency) =>
    new Intl.NumberFormat("tr-TR", { style: "currency", currency: currency || "TRY" }).format(amount ?? 0);

const emptyForm = () => ({ date: "", seats: 16, priceOverride: "", isActive: true });

export default function SessionsClient({ groups, tourType, tourId, tourLabel, currency, sessions }) {
    const router = useRouter();
    const toast = useToast();
    const isCulture = tourType === "Culture";

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);
    const [showPast, setShowPast] = useState(false);

    const today = todayISO();
    const { upcoming, past } = useMemo(
        () => ({
            upcoming: sessions.filter((s) => s.date >= today),
            past: sessions.filter((s) => s.date < today),
        }),
        [sessions, today]
    );

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const openNew = () => {
        setForm(emptyForm());
        setErrors({});
        setEditing("new");
    };

    const openEdit = (session) => {
        setForm({
            date: session.date,
            seats: session.seats,
            priceOverride: session.priceOverride ?? "",
            isActive: session.isActive,
        });
        setErrors({});
        setEditing(session);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const input = {
            date: form.date || null,
            seats: Number(form.seats) || 0,
            // Kültür turlarında fiyat konaklama tipinden gelir, geçersiz kılma gönderilmez
            priceOverride: isCulture || form.priceOverride === "" ? null : Number(form.priceOverride),
            isActive: form.isActive,
        };

        try {
            if (editing === "new") {
                await adminPost("/admin/tour-sessions", { ...input, tourType, tourId });
            } else {
                await adminPut(`/admin/tour-sessions/${editing.id}`, input);
            }

            toast.success(editing === "new" ? "Sefer eklendi." : "Sefer güncellendi.");
            setEditing(null);
            router.refresh();
        } catch (e) {
            if (e.errors) {
                setErrors(e.errors);
                toast.error("Formda eksik veya hatalı alanlar var.");
            } else {
                // 409: aynı tarihte sefer var
                toast.error(e.messages?.() ?? e.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        try {
            await adminDelete(`/admin/tour-sessions/${target.id}`);
            toast.success("Sefer silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const columns = (isPast) => [
        {
            key: "date",
            header: "Kalkış",
            primary: true,
            render: (row) => (
                <div className="min-w-0">
                    <div className="text-sm font-semibold">{fmtLong(row.date)}</div>
                    {row.priceOverride != null && (
                        <div className="mt-0.5 text-xs text-ad-brand">
                            Özel fiyat: {money(row.priceOverride, currency)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "seats",
            header: "Kontenjan",
            className: "w-36",
            render: (row) => (
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${row.seats === 0
                            ? "bg-ad-brand-soft text-ad-brand"
                            : row.seats <= 5
                                ? "bg-ad-warn-soft text-ad-warn"
                                : "bg-ad-ok-soft text-ad-ok"
                        }`}
                >
                    {row.seats === 0 ? "Dolu" : `${row.seats} kişi`}
                </span>
            ),
        },
        ...(isPast
            ? []
            : [{ key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> }]),
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title="Tur Seferleri"
                description="Kalkış tarihleri ve kontenjanları. Sefer tanımlanmayan turlarda müşteri istediği tarihi seçebilir."
                action={
                    tourId ? (
                        <button
                            type="button"
                            onClick={openNew}
                            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110"
                        >
                            <Icon name="add" className="text-[19px]" />
                            Sefer Ekle
                        </button>
                    ) : null
                }
            />

            <OwnerPicker groups={groups} typeParam="tourType" idParam="tourId" type={tourType} id={tourId} />

            {!tourId ? (
                <EmptyState icon="touch_app" title="Tur seçin" text="Seferleri görmek için yukarıdan bir tur seçin." />
            ) : (
                <>
                    <p className="mb-4 flex items-start gap-2 rounded-xl bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                        <Icon name="lightbulb" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                        <span>
                            Sefer eklediğiniz anda müşteri <strong className="text-ad-body">sadece bu tarihleri</strong>{" "}
                            seçebilir. Kontenjan sıfırsa tarih dolu görünür.
                            {isCulture && " Kültür turlarında fiyat konaklama tipinden gelir, sefere özel fiyat girilemez."}
                        </span>
                    </p>

                    <DataList
                        rows={upcoming}
                        columns={columns(false)}
                        empty={
                            <EmptyState
                                icon="event"
                                title="Yaklaşan sefer yok"
                                text={`"${tourLabel}" için müşteri şu an istediği ileri tarihi seçebiliyor.`}
                            >
                                <button
                                    type="button"
                                    onClick={openNew}
                                    className="mt-2 flex h-11 items-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125"
                                >
                                    <Icon name="add" className="text-[18px]" />
                                    Sefer Ekle
                                </button>
                            </EmptyState>
                        }
                        actions={(row) => [
                            { label: "Düzenle", icon: "edit", onClick: () => openEdit(row) },
                            { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                        ]}
                    />

                    {past.length > 0 && (
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={() => setShowPast((v) => !v)}
                                className="flex h-10 items-center gap-2 text-sm font-semibold text-ad-muted transition-colors hover:text-ad-ink"
                            >
                                <Icon
                                    name="expand_more"
                                    className={`text-[19px] transition-transform ${showPast ? "rotate-180" : ""}`}
                                />
                                Geçmiş seferler ({past.length})
                            </button>

                            {showPast && (
                                <div className="mt-3 opacity-70">
                                    <DataList
                                        rows={past}
                                        columns={columns(true)}
                                        actions={(row) => [
                                            { label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) },
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <FormDialog
                open={Boolean(editing)}
                title={editing === "new" ? "Yeni Sefer" : "Seferi Düzenle"}
                description={tourLabel}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
                saveLabel={editing === "new" ? "Ekle" : "Kaydet"}
            >
                <Field label="Kalkış Tarihi" required error={fieldError("date")}>
                    <DateInput
                        required
                        value={form.date}
                        error={fieldError("date")}
                        onChange={(e) => set("date")(e.target.value)}
                    />
                </Field>

                <Field label="Kontenjan" required hint="0 yazarsanız dolu görünür" error={fieldError("seats")}>
                    <NumberInput
                        min="0"
                        step="1"
                        suffix="kişi"
                        value={form.seats}
                        error={fieldError("seats")}
                        onChange={(e) => set("seats")(e.target.value)}
                    />
                </Field>

                {!isCulture && (
                    <div className="sm:col-span-2">
                        <Field
                            label="Sefere Özel Fiyat"
                            hint="Boş bırakılırsa dönemsel fiyat veya temel fiyat kullanılır"
                            error={fieldError("priceOverride")}
                        >
                            <NumberInput
                                min="0"
                                step="0.01"
                                value={form.priceOverride}
                                error={fieldError("priceOverride")}
                                onChange={(e) => set("priceOverride")(e.target.value)}
                            />
                        </Field>
                    </div>
                )}

                <div className="sm:col-span-2">
                    <Switch
                        label="Satışta"
                        hint="Kapalıyken bu tarih müşteriye gösterilmez"
                        checked={form.isActive}
                        onChange={set("isActive")}
                    />
                </div>
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title="Sefer silinsin mi?"
                message={`${target ? fmtLong(target.date) : ""} tarihli kalkış kaldırılır.`}
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}