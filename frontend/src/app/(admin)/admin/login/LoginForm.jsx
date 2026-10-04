"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const expired = params.get("expired") === "1";
    const from = params.get("from");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(expired ? "Oturum süresi doldu, tekrar giriş yapın." : "");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setError("");

        try {
            const response = await fetch("/api/admin/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            if (!response.ok) {
                const body = await response.json().catch(() => null);
                const fieldErrors = body?.errors ? Object.values(body.errors).flat().join(" ") : null;

                // 429: giriş denemesi sınırı (dakikada 5)
                setError(
                    response.status === 429
                        ? "Çok fazla deneme yapıldı. Bir dakika sonra tekrar deneyin."
                        : fieldErrors || body?.title || "E-posta veya şifre hatalı."
                );
                setPassword("");
                return;
            }

            // Çerez ayarlandı, sunucu tarafı yeniden değerlendirilmeli
            router.replace(from && from.startsWith("/admin") ? from : "/admin");
            router.refresh();
        } catch {
            setError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.");
        } finally {
            setBusy(false);
        }
    };

    const fieldCls =
        "w-full rounded-xl border border-[var(--ad-line)] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--ad-brand)]";

    return (
        <div className="w-full max-w-sm">
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ad-brand)] text-lg font-extrabold text-white">
                    R
                </span>
                <div>
                    <h1 className="text-xl font-bold">Yönetim Paneli</h1>
                    <p className="mt-1 text-sm text-[var(--ad-muted)]">Devam etmek için giriş yapın.</p>
                </div>
            </div>

            <form
                onSubmit={submit}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--ad-line)] bg-[var(--ad-surface)] p-5 shadow-sm sm:p-6"
            >
                {error && (
                    <p
                        role="alert"
                        className="flex items-start gap-2 rounded-xl bg-[var(--ad-brand-soft)] px-3 py-2.5 text-sm text-[var(--ad-brand-dark)]"
                    >
                        <Icon name="error" className="mt-0.5 shrink-0 text-[18px]" />
                        <span>{error}</span>
                    </p>
                )}

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ad-muted)]">
                        E-posta
                    </span>
                    <input
                        type="email"
                        required
                        autoComplete="username"
                        autoFocus
                        dir="ltr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={fieldCls}
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ad-muted)]">Şifre</span>
                    <span className="relative block">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            dir="ltr"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${fieldCls} pe-12`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                            className="absolute end-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--ad-muted)] transition-colors hover:text-[var(--ad-text)]"
                        >
                            <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[20px]" />
                        </button>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[var(--ad-brand-dark)] disabled:opacity-60"
                >
                    {busy && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
                    {busy ? "Giriş yapılıyor" : "Giriş Yap"}
                </button>
            </form>

            <p className="mt-5 text-center text-xs text-[var(--ad-muted)]">Rentravel Turizm · Yönetim Paneli</p>
        </div>
    );
}