"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";

export default function LoginForm() {
    const router = useRouter();
    const params = useSearchParams();
    const from = params.get("from");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(
        params.get("expired") === "1" ? "Oturum süresi doldu, tekrar giriş yapın." : ""
    );
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

                setError(
                    response.status === 429
                        ? "Çok fazla deneme yapıldı. Bir dakika sonra tekrar deneyin."
                        : fieldErrors || body?.title || "E-posta veya şifre hatalı."
                );
                setPassword("");
                return;
            }

            router.replace(from && from.startsWith("/admin") ? from : "/admin");
            router.refresh(); // çerez ayarlandı, sunucu tarafı yeniden değerlendirilsin
        } catch {
            setError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="w-full max-w-[380px]">
            {/* Mobil marka */}
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark text-base font-extrabold text-white shadow-ad-brand">
                    R
                </span>
                <span className="text-sm font-bold tracking-[0.2em] text-ad-ink">RENTRAVEL</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight">Tekrar hoş geldiniz</h1>
            <p className="mt-1.5 text-sm text-ad-muted">Yönetim paneline erişmek için giriş yapın.</p>

            <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
                {error && (
                    <p
                        role="alert"
                        className="flex items-start gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-3.5 py-3 text-sm text-ad-brand-dark"
                    >
                        <Icon name="error" className="mt-px shrink-0 text-[18px]" />
                        <span>{error}</span>
                    </p>
                )}

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ad-body">E-posta</span>
                    <input
                        type="email"
                        required
                        autoComplete="username"
                        autoFocus
                        dir="ltr"
                        placeholder="ornek@rentravel.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="ad-field"
                    />
                </label>

                <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-ad-body">Şifre</span>
                    <span className="relative block">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            dir="ltr"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="ad-field pe-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                            className="absolute end-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                        >
                            <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[19px]" />
                        </button>
                    </span>
                </label>

                <button
                    type="submit"
                    disabled={busy}
                    className="mt-2 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark text-sm font-bold tracking-wide text-white shadow-ad-brand transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
                >
                    {busy && <Icon name="progress_activity" className="animate-spin text-[18px]" />}
                    {busy ? "Giriş yapılıyor" : "Giriş Yap"}
                </button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-ad-faint">
                <Icon name="lock" className="text-[14px]" />
                Oturumunuz şifreli çerezle korunur
            </p>
        </div>
    );
}