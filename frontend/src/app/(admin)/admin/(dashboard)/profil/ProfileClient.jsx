"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/admin/Toast";
import { Field, FormSection, TextInput } from "@/components/admin/fields";
import { adminPut, logout } from "@/lib/admin/client";

export default function ProfileClient({ me }) {
    const toast = useToast();

    const [form, setForm] = useState({ currentPassword: "", newPassword: "", repeatPassword: "" });
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const mismatch = form.repeatPassword.length > 0 && form.newPassword !== form.repeatPassword;

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        if (mismatch) {
            setErrors({ repeatPassword: ["Şifreler aynı değil."] });
            return;
        }

        setBusy(true);
        setErrors({});

        try {
            await adminPut("/admin/me/password", {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });

            toast.success("Şifreniz değiştirildi. Tekrar giriş yapmanız gerekiyor.");
            setForm({ currentPassword: "", newPassword: "", repeatPassword: "" });

            // Şifre değişti, mevcut token'la devam etmek güvenli değil
            setTimeout(logout, 1500);
        } catch (e) {
            if (e.errors) setErrors(e.errors);
            else toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    const passwordField = (name, label, hint) => (
        <Field label={label} required hint={hint} error={fieldError(name)}>
            <TextInput
                type={show ? "text" : "password"}
                required
                dir="ltr"
                autoComplete={name === "currentPassword" ? "current-password" : "new-password"}
                value={form[name]}
                error={fieldError(name)}
                onChange={set(name)}
            />
        </Field>
    );

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Profilim</h1>
                <p className="mt-1 text-sm text-ad-muted">Hesap bilgileriniz ve şifre değişikliği.</p>
            </div>

            {/* Hesap kartı */}
            <section className="ad-card flex items-center gap-4 p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ad-brand to-ad-brand-dark text-xl font-extrabold uppercase text-white shadow-ad-brand">
                    {me?.fullName?.charAt(0) ?? "?"}
                </span>
                <div className="min-w-0">
                    <div className="truncate text-base font-bold">{me?.fullName ?? "Bilinmiyor"}</div>
                    <div dir="ltr" className="truncate text-sm text-ad-muted">
                        {me?.email}
                    </div>
                </div>
            </section>

            <p className="flex items-start gap-2 rounded-xl bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                <Icon name="info" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                <span>
                    Ad veya e-posta değişikliği için{" "}
                    <Link href="/admin/kullanicilar" className="font-semibold text-ad-brand hover:underline">
                        Yöneticiler
                    </Link>{" "}
                    sayfasını kullanın.
                </span>
            </p>

            {/* Şifre değiştirme */}
            <form onSubmit={submit}>
                <FormSection
                    title="Şifre Değiştir"
                    description="Yeni şifre en az 10 karakter olmalı. Değişiklikten sonra tekrar giriş yapmanız istenir."
                    columns={2}
                >
                    <div className="sm:col-span-2">{passwordField("currentPassword", "Mevcut Şifre")}</div>

                    {passwordField("newPassword", "Yeni Şifre", "En az 10 karakter")}

                    <Field
                        label="Yeni Şifre (tekrar)"
                        required
                        error={mismatch ? "Şifreler aynı değil." : fieldError("repeatPassword")}
                    >
                        <TextInput
                            type={show ? "text" : "password"}
                            required
                            dir="ltr"
                            autoComplete="new-password"
                            value={form.repeatPassword}
                            error={mismatch || fieldError("repeatPassword")}
                            onChange={set("repeatPassword")}
                        />
                    </Field>

                    <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                            type="button"
                            onClick={() => setShow((v) => !v)}
                            className="flex h-10 items-center gap-1.5 self-start rounded-lg px-2 text-xs font-semibold text-ad-muted transition-colors hover:text-ad-ink"
                        >
                            <Icon name={show ? "visibility_off" : "visibility"} className="text-[17px]" />
                            {show ? "Şifreleri gizle" : "Şifreleri göster"}
                        </button>

                        <button
                            type="submit"
                            disabled={busy || mismatch}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-6 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            {busy && <Icon name="progress_activity" className="animate-spin text-[17px]" />}
                            Şifreyi Değiştir
                        </button>
                    </div>
                </FormSection>
            </form>

            {/* Oturum */}
            <section className="ad-card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="text-sm font-bold">Oturumu kapat</div>
                    <p className="mt-0.5 text-xs text-ad-muted">
                        Ortak bir bilgisayar kullanıyorsanız işiniz bittiğinde çıkış yapın.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={logout}
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-5 text-sm font-bold text-ad-brand transition-colors hover:brightness-95"
                >
                    <Icon name="logout" className="text-[18px]" />
                    Çıkış Yap
                </button>
            </section>
        </div>
    );
}