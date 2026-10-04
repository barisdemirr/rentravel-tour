"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/admin/Toast";
import LocalizedField, { TranslateAllButton, cleanLocalized, toLocalized } from "@/components/admin/LocalizedField";
import { Field, FormActions, FormSection, Switch, TextInput } from "@/components/admin/fields";
import { adminPost, adminPut } from "@/lib/admin/client";
import { slugify } from "@/lib/admin/slug";

export default function StaticPageForm({ record, nextOrder }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !record;

    const [form, setForm] = useState(() => ({
        slug: record?.slug ?? "",
        title: toLocalized(record?.title),
        content: toLocalized(record?.content),
        seoTitle: toLocalized(record?.seoTitle),
        seoDescription: toLocalized(record?.seoDescription),
        orderIndex: record?.orderIndex ?? nextOrder,
        isActive: record?.isActive ?? true,
    }));
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? null;
    const flatErrors = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));

    const onTitleChange = (value) =>
        setForm((f) => ({ ...f, title: value, slug: isNew && !f.slugTouched ? slugify(value.tr) : f.slug }));

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const body = {
            slug: form.slug.trim() || null,
            title: cleanLocalized(form.title),
            content: cleanLocalized(form.content),
            seoTitle: cleanLocalized(form.seoTitle),
            seoDescription: cleanLocalized(form.seoDescription),
            orderIndex: Number(form.orderIndex) || 0,
            isActive: form.isActive,
        };

        try {
            if (isNew) await adminPost("/admin/static-pages", body);
            else await adminPut(`/admin/static-pages/${record.id}`, body);

            toast.success(isNew ? "Sayfa oluşturuldu." : "Değişiklikler kaydedildi.");
            router.push("/admin/sayfalar");
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
        { name: "title", label: "Sayfa başlığı", value: form.title, set: set("title") },
        { name: "content", label: "Sayfa içeriği", value: form.content, set: set("content") },
        { name: "seoTitle", label: "SEO başlığı", value: form.seoTitle, set: set("seoTitle") },
        { name: "seoDescription", label: "SEO açıklaması", value: form.seoDescription, set: set("seoDescription") },
    ];

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            <div className="flex items-start gap-3">
                <Link
                    href="/admin/sayfalar"
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px] rtl:-scale-x-100" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {isNew ? "Yeni Sayfa" : form.title.tr || "Sayfa Düzenle"}
                    </h1>
                    <p className="mt-1 text-sm text-ad-muted">{isNew ? "Gizlilik, şartlar, SSS gibi" : `/${form.slug}`}</p>
                </div>
            </div>

            <FormSection title="İçerik" columns={1}>
                <LocalizedField
                    name="title"
                    label="Sayfa Başlığı"
                    required
                    maxLength={150}
                    value={form.title}
                    onChange={onTitleChange}
                    errors={flatErrors}
                />

                <Field label="Adres (slug)" hint="Boş bırakılırsa başlıktan üretilir" error={fieldError("slug")}>
                    <TextInput
                        dir="ltr"
                        placeholder="gizlilik-politikasi"
                        value={form.slug}
                        error={fieldError("slug")}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }))}
                    />
                </Field>

                <LocalizedField
                    name="content"
                    label="Sayfa İçeriği"
                    required
                    hint="HTML kullanılabilir: <h2>, <p>, <ul>, <a>. Script ve stil etiketleri kaydederken temizlenir."
                    multiline
                    rows={16}
                    value={form.content}
                    onChange={set("content")}
                    errors={flatErrors}
                    translateHint="Hukuki veya bilgilendirici sayfa metni, HTML etiketlerini koru"
                />
            </FormSection>

            <FormSection title="Arama motoru" columns={1}>
                <LocalizedField
                    name="seoTitle"
                    label="Sayfa Başlığı"
                    maxLength={120}
                    value={form.seoTitle}
                    onChange={set("seoTitle")}
                    errors={flatErrors}
                />
                <LocalizedField
                    name="seoDescription"
                    label="Açıklama"
                    multiline
                    rows={3}
                    maxLength={300}
                    value={form.seoDescription}
                    onChange={set("seoDescription")}
                    errors={flatErrors}
                />
            </FormSection>

            <FormSection title="Yayın" columns={1}>
                <Switch
                    label="Yayında"
                    hint="Kapalıyken adresi 404 verir ve alt menüde görünmez"
                    checked={form.isActive}
                    onChange={set("isActive")}
                />
            </FormSection>

            <FormActions
                busy={busy}
                onCancel={() => router.push("/admin/sayfalar")}
                saveLabel={isNew ? "Oluştur" : "Kaydet"}
                extra={<TranslateAllButton fields={translatable} />}
            />
        </form>
    );
}