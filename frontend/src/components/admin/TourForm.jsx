"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import IconField from "@/components/admin/IconField";
import LocalizedListField from "@/components/admin/LocalizedListField";
import MediaPicker from "@/components/admin/MediaPicker";
import RepeaterField from "@/components/admin/RepeaterField";
import { useToast } from "@/components/admin/Toast";
import LocalizedField, {
    TranslateAllButton,
    cleanLocalized,
    emptyLocalized,
    toLocalized,
} from "@/components/admin/LocalizedField";
import { Field, FormActions, FormSection, NumberInput, SelectInput, Switch, TextInput } from "@/components/admin/fields";
import { adminPost, adminPut } from "@/lib/admin/client";

const CURRENCIES = ["TRY", "USD", "EUR"];
const TONES = [
    { value: "", label: "Nötr (gri)" },
    { value: "primary", label: "Kırmızı" },
    { value: "emerald", label: "Yeşil" },
];

const emptyBadge = () => ({ icon: "", label: emptyLocalized(), tone: "" });
const emptyPill = () => ({ label: emptyLocalized(), icon: "", highlight: false });
const emptySpec = () => ({ icon: "", label: emptyLocalized(), sub: emptyLocalized(), tone: "" });
const emptyStop = () => ({ icon: "", time: "", title: emptyLocalized(), description: emptyLocalized(), isFinal: false });

/** DTO'dan form durumu */
function initialState(record, variant, nextOrder) {
    const state = {
        slug: record?.slug ?? "",
        categoryId: record?.category?.id ?? "",
        title: toLocalized(record?.title),
        description: toLocalized(record?.description),
        longDescription: toLocalized(record?.longDescription),
        image: record?.image ?? null,
        gallery: record?.gallery ?? [],
        duration: record?.duration ?? "",
        transport: toLocalized(record?.transport),
        transportIcon: record?.transportIcon ?? "",
        badges: (record?.badges ?? []).map((b) => ({
            icon: b.icon ?? "",
            label: toLocalized(b.label),
            tone: b.tone ?? "",
        })),
        routePills: (record?.routePills ?? []).map((p) => ({
            label: toLocalized(p.label),
            icon: p.icon ?? "",
            highlight: Boolean(p.highlight),
        })),
        quickSpecs: (record?.quickSpecs ?? []).map((s) => ({
            icon: s.icon ?? "",
            label: toLocalized(s.label),
            sub: toLocalized(s.sub),
            tone: s.tone ?? "",
        })),
        itinerary: (record?.itinerary ?? []).map((i) => ({
            icon: i.icon ?? "",
            time: i.time ?? "",
            title: toLocalized(i.title),
            description: toLocalized(i.description),
            isFinal: Boolean(i.isFinal),
        })),
        included: (record?.inclusions?.included ?? []).map((i) => ({ icon: i.icon ?? "", text: toLocalized(i.text) })),
        excluded: (record?.inclusions?.excluded ?? []).map((i) => ({ icon: i.icon ?? "", text: toLocalized(i.text) })),
        travelNotes: (record?.travelNotes ?? []).map((n) => ({ icon: n.icon ?? "", text: toLocalized(n.text) })),
        seatsTotal: record?.seatsTotal ?? "",
        defaultBasePrice: record?.defaultBasePrice ?? "",
        currency: record?.currency ?? "TRY",
        seoTitle: toLocalized(record?.seoTitle),
        seoDescription: toLocalized(record?.seoDescription),
        seoKeywords: toLocalized(record?.seoKeywords),
        ogImage: record?.ogImage ?? null,
        isFeatured: record?.isFeatured ?? false,
        isActive: record?.isActive ?? true,
        orderIndex: record?.orderIndex ?? nextOrder,
    };

    if (variant === "culture") state.nights = record?.nights ?? 2;
    return state;
}

const cleanList = (list) =>
    list.filter((i) => i.text?.tr?.trim()).map((i) => ({ icon: i.icon?.trim() || null, text: cleanLocalized(i.text) }));

export default function TourForm({ variant, record, isCopy = false, categories, nextOrder }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !record?.id; // kopya modunda record var ama id yok → yeni kayıt
    const isCulture = variant === "culture";

    const api = isCulture ? "culture-tours" : "daily-tours";
    const base = isCulture ? "/admin/kultur-turlari" : "/admin/gunubirlik-turlar";
    const label = isCulture ? "Kültür Turu" : "Günübirlik Tur";
    const publicBase = isCulture ? "/konaklamali-turlar" : "/gunubirlik-turlar";

    const [form, setForm] = useState(() => initialState(record, variant, nextOrder));
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

        const trimmedSlug = form.slug.trim();

        const body = {
            // Boş bırakılırsa backend addan üretir
            slug: trimmedSlug || null,
            categoryId: form.categoryId || null,
            title: cleanLocalized(form.title),
            description: cleanLocalized(form.description),
            longDescription: cleanLocalized(form.longDescription),
            image: form.image,
            gallery: form.gallery,
            badge: null, // site tarafında kullanılmıyor
            badgeTone: null,
            duration: form.duration.trim() || null,
            transport: cleanLocalized(form.transport),
            transportIcon: form.transportIcon.trim() || null,
            badges: form.badges
                .filter((b) => b.label?.tr?.trim())
                .map((b) => ({ icon: b.icon?.trim() ?? "", label: cleanLocalized(b.label), tone: b.tone || "neutral" })),
            routePills: form.routePills
                .filter((p) => p.label?.tr?.trim())
                .map((p) => ({
                    label: cleanLocalized(p.label),
                    icon: p.icon?.trim() || null,
                    highlight: Boolean(p.highlight),
                })),
            quickSpecs: form.quickSpecs
                .filter((s) => s.label?.tr?.trim())
                .map((s) => ({
                    icon: s.icon?.trim() ?? "",
                    label: cleanLocalized(s.label),
                    sub: cleanLocalized(s.sub),
                    tone: s.tone || null,
                })),
            editorial: null, // tanıtım bölümü kullanılmıyor
            itinerary: form.itinerary
                .filter((i) => i.title?.tr?.trim())
                .map((i) => ({
                    icon: i.icon?.trim() ?? "",
                    time: i.time?.trim() ?? "",
                    title: cleanLocalized(i.title),
                    description: cleanLocalized(i.description),
                    isFinal: Boolean(i.isFinal),
                })),
            inclusions:
                form.included.length || form.excluded.length
                    ? { included: cleanList(form.included), excluded: cleanList(form.excluded) }
                    : null,
            travelNotes: cleanList(form.travelNotes),
            seatsTotal: Number(form.seatsTotal) || 0,
            seoTitle: cleanLocalized(form.seoTitle),
            seoDescription: cleanLocalized(form.seoDescription),
            seoKeywords: cleanLocalized(form.seoKeywords),
            ogImage: form.ogImage,
            defaultBasePrice: Number(form.defaultBasePrice) || 0,
            currency: form.currency,
            isFeatured: form.isFeatured,
            isActive: form.isActive,
            orderIndex: Number(form.orderIndex) || 0,
        };

        if (isCulture) body.nights = Number(form.nights) || 0;

        try {
            if (isNew) await adminPost(`/admin/${api}`, body);
            else await adminPut(`/admin/${api}/${record.id}`, body);

            toast.success(isCopy ? `${label} kopyalandı.` : isNew ? `${label} eklendi.` : "Değişiklikler kaydedildi.");
            router.push(base);
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
        { name: "title", label: "Tur adı", value: form.title, set: set("title") },
        { name: "description", label: "Kart açıklaması", value: form.description, set: set("description") },
        { name: "longDescription", label: "Detaylı açıklama", value: form.longDescription, set: set("longDescription") },
        { name: "transport", label: "Ulaşım bilgisi", value: form.transport, set: set("transport") },
        { name: "seoTitle", label: "SEO başlığı", value: form.seoTitle, set: set("seoTitle") },
        { name: "seoDescription", label: "SEO açıklaması", value: form.seoDescription, set: set("seoDescription") },
    ];

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {/* Başlık */}
            <div className="flex items-start gap-3">
                <Link
                    href={base}
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px]" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {isCopy ? `${label} Kopyala` : isNew ? `Yeni ${label}` : form.title.tr || `${label} Düzenle`}
                    </h1>
                    <p className="mt-1 text-sm text-ad-muted">
                        {isCopy
                            ? `Mevcut bir ${label.toLowerCase()} kopyasından önceden dolduruldu. Kaydedince yeni bir kayıt oluşur.`
                            : isNew
                                ? "Zorunlu alanlar: ad, taban fiyat."
                                : `Adres: ${publicBase}/${record.slug}`}
                    </p>
                </div>
            </div>

            {isCopy && (
                <div className="flex items-start gap-3 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 py-3">
                    <Icon name="content_copy" className="mt-0.5 shrink-0 text-[20px] text-ad-brand" />
                    <div className="min-w-0 text-sm text-ad-body">
                        <strong className="font-semibold">Bu bir kopya.</strong> Kaydettiğinizde{" "}
                        <strong>yeni bir {label.toLowerCase()}</strong> oluşturulur; orijinal kayıt etkilenmez. Kopya{" "}
                        <strong>taslak</strong> olarak kaydedilir (yayında değil). Başlıktaki{" "}
                        <code className="rounded bg-ad-sunken px-1.5 py-0.5 text-xs">(Kopya)</code> ekini
                        düzenleyebilirsiniz.
                    </div>
                </div>
            )}

            {/* TEMEL */}
            <FormSection title="Temel bilgiler" columns={2}>
                <div className="sm:col-span-2">
                    <LocalizedField
                        name="title"
                        label="Tur Adı"
                        required
                        hint={isNew ? "Sitedeki adres bu addan otomatik oluşturulur." : undefined}
                        maxLength={150}
                        value={form.title}
                        onChange={set("title")}
                        errors={flatErrors}
                        translateHint="Tur adı. Uzungöl, Ayder gibi yer adları çevrilmez"
                    />
                </div>

                {/* URL / Slug — tek dilli */}
                <div className="sm:col-span-2">
                    <Field
                        label="Bağlantı Adresi (URL)"
                        hint={
                            isCopy
                                ? `Kopyada boş bırakırsanız addan yeni adres üretilir: ${publicBase}/<adres>`
                                : `Sitede bu turun adresi: ${publicBase}/<adres>`
                        }
                        error={fieldError("slug")}
                    >
                        <div className="flex items-stretch gap-2">
                            <span className="flex shrink-0 items-center rounded-xl bg-ad-sunken px-3 text-sm text-ad-muted">
                                {publicBase}/
                            </span>
                            <input
                                type="text"
                                value={form.slug}
                                placeholder="Boş bırakılırsa tur adından üretilir"
                                maxLength={150}
                                onChange={(e) => set("slug")(e.target.value)}
                                className="h-11 w-full rounded-xl border border-ad-line bg-surface-white px-3 text-sm text-ad-ink outline-none transition-colors focus:border-ad-brand"
                            />
                        </div>
                    </Field>
                </div>

                <Field label="Kategori" error={fieldError("categoryId")}>
                    <SelectInput value={form.categoryId} onChange={(e) => set("categoryId")(e.target.value)}>
                        <option value="">Kategori seçilmedi</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.label?.tr}
                                {!c.isActive ? " (pasif)" : ""}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <div />

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="description"
                        label="Kart Açıklaması"
                        hint="Listede tur adının altında görünür"
                        multiline
                        rows={3}
                        maxLength={300}
                        value={form.description}
                        onChange={set("description")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="longDescription"
                        label="Detaylı Açıklama"
                        hint="Detay sayfasındaki ana metin. Basit HTML kullanılabilir."
                        multiline
                        rows={6}
                        value={form.longDescription}
                        onChange={set("longDescription")}
                        errors={flatErrors}
                    />
                </div>
            </FormSection>

            {/* GÖRSELLER */}
            <FormSection title="Görseller" columns={1}>
                <MediaPicker
                    label="Kapak Görseli"
                    category={isCulture ? "CultureTour" : "DailyTour"}
                    error={fieldError("image")}
                    value={form.image}
                    onChange={set("image")}
                />
                <MediaPicker
                    label="Galeri"
                    multiple
                    category={isCulture ? "CultureTour" : "DailyTour"}
                    hint="Detay sayfasındaki fotoğraflar. Seçili bir görsele tekrar tıklarsanız listeden çıkar."
                    value={form.gallery}
                    onChange={set("gallery")}
                />
            </FormSection>

            {/* FİYAT VE KONTENJAN */}
            <FormSection title="Fiyat ve kontenjan" columns={2}>
                <Field
                    label={isCulture ? "Taban Fiyat" : "Kişi Başı Fiyat"}
                    required
                    hint={isCulture ? "Konaklama tipi seçilmezse gösterilen fiyat" : undefined}
                    error={fieldError("defaultBasePrice")}
                >
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.defaultBasePrice}
                        error={fieldError("defaultBasePrice")}
                        onChange={(e) => set("defaultBasePrice")(e.target.value)}
                    />
                </Field>

                <Field label="Para Birimi" required>
                    <SelectInput value={form.currency} onChange={(e) => set("currency")(e.target.value)}>
                        {CURRENCIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <Field
                    label="Toplam Kontenjan"
                    hint="Sefer tanımlanmadığında kullanılır"
                    error={fieldError("seatsTotal")}
                >
                    <NumberInput
                        min="0"
                        step="1"
                        suffix="kişi"
                        value={form.seatsTotal}
                        error={fieldError("seatsTotal")}
                        onChange={(e) => set("seatsTotal")(e.target.value)}
                    />
                </Field>

                {isCulture ? (
                    <Field label="Konaklama Süresi" required error={fieldError("nights")}>
                        <NumberInput
                            min="1"
                            step="1"
                            suffix="gece"
                            value={form.nights}
                            error={fieldError("nights")}
                            onChange={(e) => set("nights")(e.target.value)}
                        />
                    </Field>
                ) : (
                    <Field label="Süre" hint="Serbest metin: 8 saat, tam gün" error={fieldError("duration")}>
                        <TextInput
                            placeholder="8 saat"
                            value={form.duration}
                            onChange={(e) => set("duration")(e.target.value)}
                        />
                    </Field>
                )}

                <div className="sm:col-span-2">
                    <p className="rounded-xl bg-ad-sunken px-3.5 py-3 text-xs text-ad-muted">
                        {isCulture ? (
                            <>
                                Kültür turlarında misafir fiyatı{" "}
                                <strong className="text-ad-body">yalnızca konaklama tipinden</strong> hesaplanır. Tipleri
                                ve fiyatlarını listedeki{" "}
                                <Icon name="hotel" className="align-middle text-[14px] text-ad-brand" /> düğmesinden
                                girin.
                            </>
                        ) : (
                            <>
                                Sezonluk farklı fiyatlar için{" "}
                                <Link href="/admin/fiyat-kurallari" className="font-semibold text-ad-brand hover:underline">
                                    Dönemsel Fiyatlar
                                </Link>
                                , belirli kalkış tarihleri için{" "}
                                <Link href="/admin/tur-seferleri" className="font-semibold text-ad-brand hover:underline">
                                    Tur Seferleri
                                </Link>{" "}
                                sayfasını kullanın.
                            </>
                        )}
                    </p>
                </div>
            </FormSection>

            {/* ULAŞIM VE ROZETLER */}
            <FormSection title="Ulaşım ve vitrin" columns={2}>
                <div className="sm:col-span-2">
                    <LocalizedField
                        name="transport"
                        label="Ulaşım Bilgisi"
                        hint="Kartta görünür: Mercedes Vito ile"
                        maxLength={120}
                        value={form.transport}
                        onChange={set("transport")}
                        errors={flatErrors}
                    />
                </div>

                <IconField
                    label="Ulaşım İkonu"
                    value={form.transportIcon}
                    onChange={set("transportIcon")}
                    placeholder="directions_bus"
                />

                <div />

                <div className="sm:col-span-2">
                    <RepeaterField
                        label="Başlık Rozetleri"
                        hint="Detay sayfasında tur adının üstünde görünür"
                        max={5}
                        value={form.badges}
                        onChange={set("badges")}
                        emptyItem={emptyBadge}
                        summary={(item) => item.label?.tr}
                        addLabel="Rozet ekle"
                        renderRow={(item, update) => (
                            <>
                                <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="verified" />
                                <Field label="Renk">
                                    <SelectInput value={item.tone} onChange={(e) => update({ tone: e.target.value })}>
                                        {TONES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </SelectInput>
                                </Field>
                                <div className="sm:col-span-2">
                                    <LocalizedField
                                        name="badge-label"
                                        label="Metin"
                                        maxLength={40}
                                        value={item.label}
                                        onChange={(v) => update({ label: v })}
                                    />
                                </div>
                            </>
                        )}
                    />
                </div>

                <div className="sm:col-span-2">
                    <RepeaterField
                        label="Rota Durakları"
                        hint="Detay sayfasında oklarla gösterilen güzergah"
                        max={10}
                        value={form.routePills}
                        onChange={set("routePills")}
                        emptyItem={emptyPill}
                        summary={(item) => item.label?.tr}
                        addLabel="Durak ekle"
                        renderRow={(item, update) => (
                            <>
                                <IconField
                                    label="İkon (opsiyonel)"
                                    value={item.icon}
                                    onChange={(v) => update({ icon: v })}
                                    placeholder="place"
                                />
                                <div className="flex items-end">
                                    <Switch
                                        label="Vurgulu"
                                        hint="Kırmızı dolgulu gösterilir"
                                        checked={item.highlight}
                                        onChange={(v) => update({ highlight: v })}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <LocalizedField
                                        name="pill-label"
                                        label="Durak Adı"
                                        maxLength={60}
                                        value={item.label}
                                        onChange={(v) => update({ label: v })}
                                        translateHint="Yer adı, çevrilmemeli, sadece gerekirse uyarlanmalı"
                                    />
                                </div>
                            </>
                        )}
                    />
                </div>

                <div className="sm:col-span-2">
                    <RepeaterField
                        label="Hızlı Bilgiler"
                        hint="Galerinin altındaki bilgi şeridi: süre, kalkış saati, rehber"
                        max={5}
                        value={form.quickSpecs}
                        onChange={set("quickSpecs")}
                        emptyItem={emptySpec}
                        summary={(item) => item.label?.tr}
                        addLabel="Bilgi ekle"
                        renderRow={(item, update) => (
                            <>
                                <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="schedule" />
                                <Field label="Renk">
                                    <SelectInput value={item.tone} onChange={(e) => update({ tone: e.target.value })}>
                                        {TONES.map((t) => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </SelectInput>
                                </Field>
                                <LocalizedField
                                    name="spec-label"
                                    label="Etiket"
                                    maxLength={60}
                                    value={item.label}
                                    onChange={(v) => update({ label: v })}
                                />
                                <LocalizedField
                                    name="spec-sub"
                                    label="Değer"
                                    maxLength={60}
                                    value={item.sub}
                                    onChange={(v) => update({ sub: v })}
                                />
                            </>
                        )}
                    />
                </div>
            </FormSection>

            {/* PROGRAM */}
            <FormSection
                title={isCulture ? "Gün gün program" : "Dakika dakika program"}
                description="Zaman çizelgesi. Son durağı işaretlerseniz yeşil gösterilir."
                columns={1}
            >
                <RepeaterField
                    label="Program Adımları"
                    max={20}
                    value={form.itinerary}
                    onChange={set("itinerary")}
                    emptyItem={emptyStop}
                    summary={(item) => [item.time, item.title?.tr].filter(Boolean).join(" · ")}
                    addLabel="Adım ekle"
                    renderRow={(item, update) => (
                        <>
                            <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="directions_bus" />
                            <Field
                                label={isCulture ? "Gün / Saat" : "Saat"}
                                hint={isCulture ? "1. Gün veya 09:30" : "09:30"}
                            >
                                <TextInput
                                    dir="ltr"
                                    placeholder={isCulture ? "1. Gün" : "09:30"}
                                    value={item.time}
                                    onChange={(e) => update({ time: e.target.value })}
                                />
                            </Field>
                            <div className="sm:col-span-2">
                                <LocalizedField
                                    name="stop-title"
                                    label="Başlık"
                                    maxLength={100}
                                    value={item.title}
                                    onChange={(v) => update({ title: v })}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <LocalizedField
                                    name="stop-desc"
                                    label="Açıklama"
                                    multiline
                                    rows={3}
                                    maxLength={500}
                                    value={item.description}
                                    onChange={(v) => update({ description: v })}
                                />
                            </div>
                            <Switch
                                label="Son durak"
                                hint="Yeşil işaretlenir"
                                checked={item.isFinal}
                                onChange={(v) => update({ isFinal: v })}
                            />
                        </>
                    )}
                />
            </FormSection>

            {/* DAHİL / DAHİL DEĞİL */}
            <FormSection title="Fiyata dahil olanlar" description="İki liste de boşsa bölüm gösterilmez." columns={1}>
                <LocalizedListField
                    label="Fiyata Dahil"
                    withIcon
                    iconPlaceholder="check_circle"
                    maxLength={200}
                    max={15}
                    namePrefix="inc"
                    addLabel="Dahil madde ekle"
                    value={form.included}
                    onChange={set("included")}
                />
                <LocalizedListField
                    label="Fiyata Dahil Değil"
                    withIcon
                    iconPlaceholder="cancel"
                    maxLength={200}
                    max={15}
                    namePrefix="exc"
                    addLabel="Dahil olmayan madde ekle"
                    value={form.excluded}
                    onChange={set("excluded")}
                />
            </FormSection>

            {/* NOTLAR */}
            <FormSection title="Katılımcı tavsiyeleri" columns={1}>
                <LocalizedListField
                    label="Tavsiyeler"
                    hint="Rahat ayakkabı, yağmurluk, kimlik gibi"
                    withIcon
                    iconPlaceholder="lightbulb"
                    multiline
                    maxLength={300}
                    max={10}
                    namePrefix="note"
                    addLabel="Tavsiye ekle"
                    value={form.travelNotes}
                    onChange={set("travelNotes")}
                />
            </FormSection>

            {/* SEO */}
            <FormSection title="Arama motoru" columns={1}>
                <p className="rounded-xl bg-ad-sunken px-4 py-3 text-xs leading-relaxed text-ad-muted">
                    Bu alanlar Google sonuçlarında ve bağlantı paylaşımlarında görünür.
                    <br />
                    <strong className="text-ad-body">Sayfa başlığını</strong> boş bırakırsanız tur adı kullanılır.
                    <br />
                    <strong className="text-ad-body">Açıklamayı</strong> boş bırakırsanız kart açıklaması kullanılır.
                    <br />
                    <strong className="text-ad-body">Paylaşım görselini</strong> boş bırakırsanız kapak görseli kullanılır.
                </p>

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
                    hint="Arama sonuçlarında başlığın altında görünen iki satır"
                    multiline
                    rows={3}
                    maxLength={300}
                    value={form.seoDescription}
                    onChange={set("seoDescription")}
                    errors={flatErrors}
                />
                <LocalizedField
                    name="seoKeywords"
                    label="Anahtar Kelimeler"
                    hint="Virgülle ayırın. Zorunlu değildir."
                    maxLength={300}
                    value={form.seoKeywords}
                    onChange={set("seoKeywords")}
                    errors={flatErrors}
                />
                <MediaPicker
                    label="Paylaşım Görseli"
                    hint="WhatsApp ve sosyal medyada bağlantı paylaşılınca görünür"
                    category={isCulture ? "CultureTour" : "DailyTour"}
                    value={form.ogImage}
                    onChange={set("ogImage")}
                />
            </FormSection>

            {/* YAYIN */}
            <FormSection title="Yayın" columns={2}>
                <Switch label="Yayında" hint="Kapalıyken sitede görünmez" checked={form.isActive} onChange={set("isActive")} />
                <Switch
                    label="Öne çıkan"
                    hint="Ana sayfada gösterilir"
                    checked={form.isFeatured}
                    onChange={set("isFeatured")}
                />
            </FormSection>

            <FormActions
                busy={busy}
                onCancel={() => router.push(base)}
                saveLabel={isCopy ? "Kopyayı Oluştur" : isNew ? "Oluştur" : "Kaydet"}
                extra={<TranslateAllButton fields={translatable} />}
            />
        </form>
    );
}