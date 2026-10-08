"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import MediaPicker from "@/components/admin/MediaPicker";
import { useToast } from "@/components/admin/Toast";
import LocalizedField, {
    TranslateAllButton,
    cleanLocalized,
    toLocalized,
} from "@/components/admin/LocalizedField";
import { Field, FormActions, FormSection, NumberInput, Switch } from "@/components/admin/fields";
import { adminPost, adminPut } from "@/lib/admin/client";

function initialState(record, nextOrder) {
    return {
        image: record?.image ?? null,
        title: toLocalized(record?.title),
        description: toLocalized(record?.description),
        ctaLabel: toLocalized(record?.ctaLabel),
        ctaHref: record?.ctaHref ?? "",
        badge: record?.badge ?? "",
        badgeText: toLocalized(record?.badgeText),
        isActive: record?.isActive ?? true,
        orderIndex: record?.orderIndex ?? nextOrder,
    };
}

export default function HeroSlideForm({ record, nextOrder }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !record?.id;

    const [form, setForm] = useState(() => initialState(record, nextOrder));
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? errors[`${name}.tr`]?.[0] ?? null;
    const flatErrors = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const body = {
            image: form.image,
            title: cleanLocalized(form.title),
            description: cleanLocalized(form.description),
            ctaLabel: cleanLocalized(form.ctaLabel),
            ctaHref: form.ctaHref.trim() || null,
            badge: form.badge.trim() || null,
            badgeText: cleanLocalized(form.badgeText),
            isActive: form.isActive,
            orderIndex: Number(form.orderIndex) || 0,
        };

        try {
            if (isNew) await adminPost("/admin/hero-slides", body);
            else await adminPut(`/admin/hero-slides/${record.id}`, body);

            toast.success(isNew ? "Slayt eklendi." : "Değişiklikler kaydedildi.");
            router.push("/admin/slider");
            router.refresh();
        } catch (e) {
            if (e.errors) {
                setErrors(e.errors);
                toast.error("Formda eksik veya hatalı alanlar var.");
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                toast.error(e.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const translatable = [
        { name: "title", label: "Başlık", value: form.title, set: set("title") },
        { name: "description", label: "Açıklama", value: form.description, set: set("description") },
        { name: "ctaLabel", label: "Buton yazısı", value: form.ctaLabel, set: set("ctaLabel") },
        { name: "badgeText", label: "Üst etiket", value: form.badgeText, set: set("badgeText") },
    ];

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            <div className="flex items-start gap-3">
                <Link
                    href="/admin/slider"
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px]" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {isNew ? "Yeni Slayt" : form.title.tr || "Slayt Düzenle"}
                    </h1>
                    <p className="mt-1 text-sm text-ad-muted">
                        Ana sayfadaki dönen görsellerden biri.
                    </p>
                </div>
            </div>

            <FormSection title="Görsel" columns={1}>
                <MediaPicker
                    label="Slayt Görseli"
                    category="HeroSlide"
                    hint="Geniş, yatay bir görsel tercih edin (en az 1920×1080 önerilir)."
                    error={fieldError("image")}
                    value={form.image}
                    onChange={set("image")}
                />
            </FormSection>

            <FormSection title="İçerik" columns={1}>
                <div className="sm:col-span-2">
                    <LocalizedField
                        name="title"
                        label="Başlık"
                        required
                        maxLength={200}
                        value={form.title}
                        onChange={set("title")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="description"
                        label="Açıklama"
                        hint="Başlığın altında görünen kısa metin"
                        multiline
                        rows={3}
                        maxLength={500}
                        value={form.description}
                        onChange={set("description")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="badgeText"
                        label="Üst Etiket (opsiyonel)"
                        hint="Başlığın üstünde küçük eyebrow: 'Kampanya', 'Festival' gibi"
                        maxLength={80}
                        value={form.badgeText}
                        onChange={set("badgeText")}
                        errors={flatErrors}
                    />
                </div>

                <Field label="Badge Kodu (opsiyonel)" hint="Tema uyumlu sabit bir etiket gerekiyorsa" error={fieldError("badge")}>
                    <input
                        type="text"
                        value={form.badge}
                        maxLength={80}
                        onChange={(e) => set("badge")(e.target.value)}
                        className="h-11 w-full rounded-xl border border-ad-line bg-surface-white px-3 text-sm text-ad-ink outline-none transition-colors focus:border-ad-brand"
                    />
                </Field>
            </FormSection>

            <FormSection title="Buton" columns={1}>
                <div className="sm:col-span-2">
                    <LocalizedField
                        name="ctaLabel"
                        label="Buton Yazısı"
                        hint="Örn: Turları İncele, Hemen Rezervasyon"
                        maxLength={60}
                        value={form.ctaLabel}
                        onChange={set("ctaLabel")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <Field
                        label="Buton Bağlantısı"
                        hint="Sitedeki bir yol veya dış link: /konaklamali-turlar/uzungol-turu"
                        error={fieldError("ctaHref")}
                    >
                        <input
                            type="text"
                            value={form.ctaHref}
                            placeholder="/konaklamali-turlar/..."
                            maxLength={500}
                            onChange={(e) => set("ctaHref")(e.target.value)}
                            className="h-11 w-full rounded-xl border border-ad-line bg-surface-white px-3 text-sm text-ad-ink outline-none transition-colors focus:border-ad-brand"
                        />
                    </Field>
                </div>
            </FormSection>

            <FormSection title="Yayın" columns={2}>
                <Switch
                    label="Yayında"
                    hint="Kapalıyken ana sayfada gösterilmez"
                    checked={form.isActive}
                    onChange={set("isActive")}
                />
                <Field label="Sıra" hint="Küçük değer önce gösterilir" error={fieldError("orderIndex")}>
                    <NumberInput
                        min="0"
                        step="1"
                        value={form.orderIndex}
                        error={fieldError("orderIndex")}
                        onChange={(e) => set("orderIndex")(e.target.value)}
                    />
                </Field>
            </FormSection>

            <FormActions
                busy={busy}
                onCancel={() => router.push("/admin/slider")}
                saveLabel={isNew ? "Oluştur" : "Kaydet"}
                extra={<TranslateAllButton fields={translatable} />}
            />
        </form>
    );
}