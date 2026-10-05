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
    emptyLocalized,
    toLocalized,
} from "@/components/admin/LocalizedField";
import {
    Field,
    FormActions,
    FormSection,
    NumberInput,
    SelectInput,
    Switch,
    TextInput,
} from "@/components/admin/fields";
import { adminPost, adminPut } from "@/lib/admin/client";
import IconField from "@/components/admin/IconField";
import { slugify } from "@/lib/admin/slug";

const CURRENCIES = [
    { value: "TRY", label: "₺ Türk Lirası" },
    { value: "USD", label: "$ Amerikan Doları" },
    { value: "EUR", label: "€ Euro" },
];

/** Kaydı form durumuna çevirir (yeni kayıtta boş değerler) */
function initialState(catalog, record) {
    const state = { isActive: record?.isActive ?? true };

    for (const field of catalog.fields) {
        const value = record?.[field.name];
        switch (field.type) {
            case "localized":
                state[field.name] = toLocalized(value);
                break;
            case "number":
                state[field.name] = value ?? 0;
                break;
            case "order":
                state[field.name] = value ?? 0;
                break;
            case "money":
                state[field.name] = value ?? "";
                break;
            case "currency":
                state[field.name] = value ?? "TRY";
                break;
            case "media":
                state[field.name] = value ?? null;
                break;
            case "select":
                state[field.name] = value ?? field.default ?? field.options[0].value;
                break;
            default:
                state[field.name] = value ?? "";
        }
    }

    return state;
}

export default function CatalogForm({ slug, catalog, record, nextOrder = 0 }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !record;
    const base = `/admin/katalog/${slug}`;

    const [form, setForm] = useState(() => {
        const state = initialState(catalog, record);
        if (!record) state.orderIndex = nextOrder; // yeni kayıt listenin sonuna
        return state;
    });
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        // Gövde: boş çok dilli alanlar null, sayılar number
        const body = { isActive: form.isActive };

        for (const field of catalog.fields) {
            const value = form[field.name];
            switch (field.type) {
                case "localized":
                    body[field.name] = cleanLocalized(value);
                    break;
                case "number":
                    body[field.name] = Number(value) || 0;
                    break;
                case "order":
                    body[field.name] = Number(value) || 0;
                    break;
                case "money":
                    body[field.name] = value === "" ? 0 : Number(value);
                    break;
                case "key":
                    body[field.name] = field.lowercase === false ? value.trim() : value.trim().toLowerCase();
                    break;
                default:
                    body[field.name] = typeof value === "string" ? value.trim() || null : value;
            }
        }

        // Anahtar etiketten üretilir: yeni kayıtta addan, düzenlemede mevcut anahtar korunur
        const titleValue = form[catalog.titleField]?.tr ?? "";
        body.key = isNew ? slugify(titleValue) : record.key;

        try {
            if (isNew) {
                await adminPost(`/admin/${catalog.api}`, body);
            } else {
                await adminPut(`/admin/${catalog.api}/${record.id}`, body);
            }

            toast.success(isNew ? `${catalog.singular} eklendi.` : "Değişiklikler kaydedildi.");
            router.push(base);
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

    const localizedFields = catalog.fields
        .filter((f) => f.type === "localized")
        .map((f) => ({ name: f.name, label: f.label, value: form[f.name], set: set(f.name) }));

    const firstError = (name) => errors[name]?.[0] ?? null;

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            {/* Başlık */}
            <div className="flex items-start gap-3">
                <Link
                    href={base}
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px] rtl:-scale-x-100" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {isNew ? `Yeni ${catalog.singular}` : `${catalog.singular} Düzenle`}
                    </h1>
                    <p className="mt-1 text-sm text-ad-muted">
                        {isNew ? (
                            catalog.description
                        ) : (
                            <>
                                {record[catalog.titleField]?.tr}
                                <code dir="ltr" className="ms-2 text-ad-faint">
                                    {record.key}
                                </code>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Alanlar */}
            <FormSection title="Bilgiler" columns={2}>
                {catalog.fields.map((field) => {
                    const error = firstError(field.name) || firstError(`${field.name}.tr`);
                    const wide = field.type === "localized" || field.type === "media" || field.type === "icon";

                    const content = (() => {
                        switch (field.type) {
                            case "localized":
                                return (
                                    <LocalizedField
                                        key={field.name}
                                        name={field.name}
                                        label={field.label}
                                        hint={field.hint}
                                        required={field.required}
                                        multiline={field.multiline}
                                        maxLength={field.maxLength}
                                        value={form[field.name] ?? emptyLocalized()}
                                        onChange={set(field.name)}
                                        errors={errors && Object.fromEntries(
                                            Object.entries(errors).map(([k, v]) => [k, v[0]])
                                        )}
                                    />
                                );

                            case "media":
                                return (
                                    <MediaPicker
                                        key={field.name}
                                        label={field.label}
                                        hint={field.hint}
                                        error={error}
                                        category={field.category}
                                        value={form[field.name]}
                                        onChange={set(field.name)}
                                    />
                                );

                            case "icon":
                                return (
                                    <IconField
                                        key={field.name}
                                        label={field.label}
                                        required={field.required}
                                        error={error}
                                        value={form[field.name]}
                                        onChange={set(field.name)}
                                        placeholder={catalog.icon}
                                    />
                                );


                            case "money":
                                return (
                                    <Field
                                        key={field.name}
                                        label={field.label}
                                        required={field.required}
                                        hint={field.hint}
                                        error={error}
                                    >
                                        <NumberInput
                                            min="0"
                                            step="0.01"
                                            error={error}
                                            value={form[field.name]}
                                            onChange={(e) => set(field.name)(e.target.value)}
                                        />
                                    </Field>
                                );

                            case "number":
                                return (
                                    <Field
                                        key={field.name}
                                        label={field.label}
                                        hint={field.hint}
                                        error={error}
                                    >
                                        <NumberInput
                                            step="1"
                                            error={error}
                                            value={form[field.name]}
                                            onChange={(e) => set(field.name)(e.target.value)}
                                        />
                                    </Field>
                                );

                            case "order":
                                return null; // sıra listedeki "Sırala" modundan ayarlanır

                            case "currency":
                                return (
                                    <Field key={field.name} label={field.label} required error={error}>
                                        <SelectInput
                                            error={error}
                                            value={form[field.name]}
                                            onChange={(e) => set(field.name)(e.target.value)}
                                        >
                                            {CURRENCIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </Field>
                                );

                            case "select":
                                return (
                                    <Field
                                        key={field.name}
                                        label={field.label}
                                        required={field.required}
                                        hint={field.hint}
                                        error={error}
                                    >
                                        <SelectInput
                                            error={error}
                                            value={form[field.name]}
                                            onChange={(e) => set(field.name)(e.target.value)}
                                        >
                                            {field.options.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    </Field>
                                );

                            default:
                                return null;
                        }
                    })();

                    return wide ? (
                        <div key={field.name} className="sm:col-span-2">
                            {content}
                        </div>
                    ) : (
                        content
                    );
                })}
            </FormSection>

            {/* Yayın durumu: sadece düzenlemede, yeni kayıt zaten yayında başlar */}
            {!isNew && (
                <FormSection title="Yayın" columns={1}>
                    <Switch
                        label="Yayında"
                        hint="Kapalıyken sitede görünmez, mevcut ürünlerin bağlantısı bozulmaz."
                        checked={form.isActive}
                        onChange={set("isActive")}
                    />
                </FormSection>
            )}

            <FormActions
                busy={busy}
                onCancel={() => router.push(base)}
                saveLabel={isNew ? "Oluştur" : "Kaydet"}
                extra={localizedFields.length > 1 ? <TranslateAllButton fields={localizedFields} /> : null}
            />
        </form>
    );
}