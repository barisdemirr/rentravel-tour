"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/admin/Toast";
import { Field, FormActions, FormSection, TextInput } from "@/components/admin/fields";
import { adminPut } from "@/lib/admin/client";

const DEFAULT_ROBOTS = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://rentravel.com.tr/sitemap.xml`;

export default function SiteSettingsForm({ settings, failed }) {
    const router = useRouter();
    const toast = useToast();

    const [form, setForm] = useState({
        googleAnalyticsId: settings.googleAnalyticsId ?? "",
        searchConsoleToken: settings.searchConsoleToken ?? "",
        facebookPixelId: settings.facebookPixelId ?? "",
        yandexMetrikaId: settings.yandexMetrikaId ?? "",
        robotsTxtContent: settings.robotsTxtContent ?? "",
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        // Boş alanlar null gönderilir, backend öyle bekliyor
        const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim() || null]));

        try {
            await adminPut("/admin/site-settings", body);
            toast.success("Ayarlar kaydedildi.");
            router.refresh();
        } catch (e) {
            if (e.errors) {
                setErrors(e.errors);
                toast.error("Formda hatalı alanlar var.");
            } else {
                toast.error(e.message);
            }
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            <div>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">Site Ayarları</h1>
                <p className="mt-1 text-sm text-ad-muted">
                    Ölçümleme kodları ve arama motoru dosyaları. Boş bırakılan alanlar siteye hiç eklenmez.
                </p>
            </div>

            {failed && (
                <p className="flex items-start gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 py-3 text-sm text-ad-brand-dark">
                    <Icon name="cloud_off" className="mt-px shrink-0 text-[18px]" />
                    <span>Mevcut ayarlar okunamadı. Kaydederseniz alanlar sıfırdan yazılır.</span>
                </p>
            )}

            <FormSection
                title="Ölçümleme"
                description="Kimlikler siteye script olarak eklenir, bu yüzden sadece harf, rakam, tire ve alt çizgi kabul edilir."
                columns={2}
            >
                <Field
                    label="Google Analytics"
                    hint="Ölçüm kimliği: G-XXXXXXXXXX"
                    error={fieldError("googleAnalyticsId")}
                >
                    <TextInput
                        dir="ltr"
                        placeholder="G-XXXXXXXXXX"
                        value={form.googleAnalyticsId}
                        error={fieldError("googleAnalyticsId")}
                        onChange={set("googleAnalyticsId")}
                    />
                </Field>

                <Field
                    label="Search Console"
                    hint="Site doğrulama etiketinin içeriği"
                    error={fieldError("searchConsoleToken")}
                >
                    <TextInput
                        dir="ltr"
                        value={form.searchConsoleToken}
                        error={fieldError("searchConsoleToken")}
                        onChange={set("searchConsoleToken")}
                    />
                </Field>

                <Field label="Meta Pixel" hint="Sadece rakam" error={fieldError("facebookPixelId")}>
                    <TextInput
                        dir="ltr"
                        placeholder="123456789012345"
                        value={form.facebookPixelId}
                        error={fieldError("facebookPixelId")}
                        onChange={set("facebookPixelId")}
                    />
                </Field>

                <Field label="Yandex Metrika" hint="Sadece rakam" error={fieldError("yandexMetrikaId")}>
                    <TextInput
                        dir="ltr"
                        placeholder="98765432"
                        value={form.yandexMetrikaId}
                        error={fieldError("yandexMetrikaId")}
                        onChange={set("yandexMetrikaId")}
                    />
                </Field>
            </FormSection>

            <FormSection
                title="robots.txt"
                description="Arama motorlarına hangi sayfaların taranacağını söyler. Boş bırakılırsa varsayılan kullanılır."
                columns={1}
            >
                <Field label="İçerik" error={fieldError("robotsTxtContent")}>
                    <TextInput
                        as="textarea"
                        rows={10}
                        dir="ltr"
                        maxLength={5000}
                        placeholder={DEFAULT_ROBOTS}
                        value={form.robotsTxtContent}
                        error={fieldError("robotsTxtContent")}
                        onChange={set("robotsTxtContent")}
                    />
                </Field>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, robotsTxtContent: DEFAULT_ROBOTS }))}
                        className="flex h-10 items-center gap-1.5 rounded-lg border border-ad-line-strong px-3 text-xs font-semibold text-ad-body transition-colors hover:bg-ad-sunken"
                    >
                        <Icon name="auto_fix_high" className="text-[16px]" />
                        Önerilen içeriği doldur
                    </button>
                    <a
                        href="/robots.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-ad-brand transition-colors hover:bg-ad-brand-soft"
                    >
                        <Icon name="open_in_new" className="text-[16px]" />
                        Yayındaki dosyayı gör
                    </a>
                </div>
            </FormSection>

            <FormActions busy={busy} saveLabel="Kaydet" />
        </form>
    );
}