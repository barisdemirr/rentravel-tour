"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import DataList, { EmptyState, PageHeader, StatusBadge } from "@/components/admin/DataList";
import FormDialog from "@/components/admin/FormDialog";
import { useToast } from "@/components/admin/Toast";
import { Field, Switch, TextInput } from "@/components/admin/fields";
import { adminDelete, adminPost, adminPut } from "@/lib/admin/client";

const fmtDate = (iso) =>
    iso
        ? new Date(iso).toLocaleString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "Hiç giriş yapılmadı";

export default function UsersClient({ rows, meId, failed }) {
    const router = useRouter();
    const toast = useToast();

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ email: "", fullName: "", password: "", isActive: true });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const openNew = () => {
        setForm({ email: "", fullName: "", password: "", isActive: true });
        setShowPassword(false);
        setErrors({});
        setEditing("new");
    };

    const openEdit = (user) => {
        setForm({ email: user.email, fullName: user.fullName, password: "", isActive: user.isActive });
        setErrors({});
        setEditing(user);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        try {
            if (editing === "new") {
                await adminPost("/admin/users", {
                    email: form.email.trim(),
                    fullName: form.fullName.trim(),
                    password: form.password,
                });
                toast.success("Yönetici eklendi.");
            } else {
                await adminPut(`/admin/users/${editing.id}`, {
                    email: form.email.trim(),
                    fullName: form.fullName.trim(),
                    isActive: form.isActive,
                });
                toast.success("Yönetici güncellendi.");
            }

            setEditing(null);
            router.refresh();
        } catch (e) {
            if (e.errors) {
                setErrors(e.errors);
                toast.error("Formda eksik veya hatalı alanlar var.");
            } else {
                // 409: e-posta kullanımda veya kendi hesabını pasife alma denemesi
                toast.error(e.messages?.() ?? e.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        try {
            await adminDelete(`/admin/users/${target.id}`);
            toast.success(`"${target.fullName}" kaldırıldı.`);
            setTarget(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    const columns = [
        {
            key: "user",
            header: "Yönetici",
            primary: true,
            render: (row) => (
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ad-brand to-ad-brand-dark text-xs font-bold uppercase text-white">
                        {row.fullName.charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-semibold">{row.fullName}</span>
                            {row.id === meId && (
                                <span className="shrink-0 rounded bg-ad-brand-soft px-1.5 py-0.5 text-[10px] font-bold text-ad-brand">
                                    Siz
                                </span>
                            )}
                        </div>
                        <span dir="ltr" className="block truncate text-xs text-ad-faint">
                            {row.email}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: "lastLogin",
            header: "Son Giriş",
            hideOnMobile: true,
            className: "w-48",
            render: (row) => <span className="text-sm text-ad-muted">{fmtDate(row.lastLoginAt)}</span>,
        },
        { key: "status", header: "Durum", className: "w-28", render: (row) => <StatusBadge active={row.isActive} /> },
    ];

    return (
        <div className="mx-auto w-full max-w-5xl">
            <PageHeader
                title="Yöneticiler"
                description="Panele giriş yapabilen kişiler. Tüm yöneticilerin yetkileri aynıdır."
                action={
                    <button
                        type="button"
                        onClick={openNew}
                        className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110"
                    >
                        <Icon name="person_add" className="text-[19px]" />
                        Yönetici Ekle
                    </button>
                }
            />

            <p className="mb-4 flex items-start gap-2 rounded-xl bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                <Icon name="shield" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                <span>
                    Bir hesabı pasife alırsanız o kişinin açık oturumu da{" "}
                    <strong className="text-ad-body">anında geçersiz</strong> olur. Kendi hesabınızı pasife alamaz veya
                    silemezsiniz.
                </span>
            </p>

            {failed ? (
                <EmptyState icon="cloud_off" title="Veriler yüklenemedi" text="Sunucuya ulaşılamıyor." />
            ) : (
                <DataList
                    rows={rows}
                    columns={columns}
                    empty={<EmptyState icon="group" title="Yönetici yok" text="Bu beklenmeyen bir durum." />}
                    actions={(row) => [
                        { label: "Düzenle", icon: "edit", onClick: () => openEdit(row) },
                        ...(row.id === meId
                            ? []
                            : [{ label: "Sil", icon: "delete", danger: true, onClick: () => setTarget(row) }]),
                    ]}
                />
            )}

            <FormDialog
                open={Boolean(editing)}
                title={editing === "new" ? "Yeni Yönetici" : "Yöneticiyi Düzenle"}
                description={editing !== "new" && editing ? editing.email : undefined}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
                saveLabel={editing === "new" ? "Ekle" : "Kaydet"}
            >
                <Field label="Ad Soyad" required error={fieldError("fullName")}>
                    <TextInput
                        required
                        value={form.fullName}
                        error={fieldError("fullName")}
                        onChange={(e) => set("fullName")(e.target.value)}
                    />
                </Field>

                <Field label="E-posta" required error={fieldError("email")}>
                    <TextInput
                        type="email"
                        required
                        dir="ltr"
                        autoComplete="off"
                        value={form.email}
                        error={fieldError("email")}
                        onChange={(e) => set("email")(e.target.value)}
                    />
                </Field>

                {editing === "new" ? (
                    <div className="sm:col-span-2">
                        <Field
                            label="Şifre"
                            required
                            hint="En az 10 karakter. Kişiye güvenli bir kanaldan iletin."
                            error={fieldError("password")}
                        >
                            <span className="relative block">
                                <TextInput
                                    type={showPassword ? "text" : "password"}
                                    required
                                    dir="ltr"
                                    autoComplete="new-password"
                                    value={form.password}
                                    error={fieldError("password")}
                                    onChange={(e) => set("password")(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                                    className="absolute end-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-sunken"
                                >
                                    <Icon
                                        name={showPassword ? "visibility_off" : "visibility"}
                                        className="text-[19px]"
                                    />
                                </button>
                            </span>
                        </Field>
                    </div>
                ) : (
                    <div className="sm:col-span-2">
                        <Switch
                            label="Hesap etkin"
                            hint={
                                editing?.id === meId
                                    ? "Kendi hesabınızı pasife alamazsınız"
                                    : "Kapalıyken giriş yapamaz, açık oturumu kesilir"
                            }
                            disabled={editing?.id === meId}
                            checked={form.isActive}
                            onChange={set("isActive")}
                        />
                    </div>
                )}

                {editing !== "new" && (
                    <p className="text-xs text-ad-muted sm:col-span-2">
                        Şifreyi buradan değiştiremezsiniz. Her yönetici kendi şifresini Profilim sayfasından değiştirir.
                    </p>
                )}
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title={`"${target?.fullName ?? ""}" kaldırılsın mı?`}
                message="Bu kişi artık panele giriş yapamaz."
                confirmLabel="Kaldır"
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}