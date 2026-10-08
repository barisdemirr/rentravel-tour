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
import { Field, FormActions, FormSection, NumberInput, SelectInput, Switch } from "@/components/admin/fields";
import { adminPost, adminPut } from "@/lib/admin/client";

const CURRENCIES = ["TRY", "USD", "EUR"];

const emptySpec = () => ({ icon: "", label: emptyLocalized(), value: emptyLocalized() });
const emptyFeature = () => ({ icon: "", label: emptyLocalized(), sub: emptyLocalized(), tone: "" });
const emptyDistance = () => ({ place: emptyLocalized(), value: emptyLocalized() });
const emptyRule = () => ({ icon: "", title: emptyLocalized(), text: emptyLocalized() });

const toSpec = (s) => ({ icon: s.icon ?? "", label: toLocalized(s.label), value: toLocalized(s.value) });

function initialState(record, nextOrder) {
    return {
        slug: record?.slug ?? "",
        regionId: record?.region?.id ?? "",
        title: toLocalized(record?.title),
        description: toLocalized(record?.description),
        longDescription: toLocalized(record?.longDescription),
        location: toLocalized(record?.location),
        capacity: toLocalized(record?.capacity),
        image: record?.image ?? null,
        gallery: record?.gallery ?? [],
        breakfastIncluded: record?.breakfastIncluded ?? false,
        breakfastNote: toLocalized(record?.breakfastNote),
        breakfastCardOn: Boolean(record?.breakfastCard),
        breakfastTitle: toLocalized(record?.breakfastCard?.title),
        breakfastImage: record?.breakfastCard?.image ?? null,
        breakfastDescription: toLocalized(record?.breakfastCard?.description),
        breakfastTags: (record?.breakfastCard?.tags ?? []).map(toLocalized),
        amenities: (record?.amenities ?? []).map(toSpec),
        detailedAmenities: (record?.detailedAmenities ?? []).map(toSpec),
        featureStrip: (record?.featureStrip ?? []).map((f) => ({
            icon: f.icon ?? "",
            label: toLocalized(f.label),
            sub: toLocalized(f.sub),
            tone: f.tone ?? "",
        })),
        distances: (record?.distances ?? []).map((d) => ({
            place: toLocalized(d.place),
            value: toLocalized(d.value),
        })),
        locationNote: toLocalized(record?.locationNote),
        rules: (record?.rules ?? []).map((r) => ({
            icon: r.icon ?? "",
            title: toLocalized(r.title),
            text: toLocalized(r.text),
        })),
        defaultPricePerNight: record?.defaultPricePerNight ?? "",
        currency: record?.currency ?? "TRY",
        seoTitle: toLocalized(record?.seoTitle),
        seoDescription: toLocalized(record?.seoDescription),
        seoKeywords: toLocalized(record?.seoKeywords),
        isFeatured: record?.isFeatured ?? false,
        isActive: record?.isActive ?? true,
        orderIndex: record?.orderIndex ?? nextOrder,
    };
}

const cleanSpecs = (list) =>
    list
        .filter((s) => s.label?.tr?.trim())
        .map((s) => ({ icon: s.icon?.trim() ?? "", label: cleanLocalized(s.label), value: cleanLocalized(s.value) }));

export default function BungalowForm({ record, isCopy = false, regions, nextOrder }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !record?.id;

    const [form, setForm] = useState(() => initialState(record, nextOrder));
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? errors[`${name}.tr`]?.[0] ?? null;
    const flatErrors = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));

    /* Kart etiketlerini detay listesine kopyala: aynı şeyi iki kez yazmaya gerek kalmasın */
    const copyAmenities = () => {
        const source = form.amenities.filter((a) => a.label?.tr?.trim());

        if (source.length === 0) {
            toast.error("Önce kart etiketlerini doldurun.");
            return;
        }

        const existing = new Set(form.detailedAmenities.map((a) => a.label?.tr?.trim().toLocaleLowerCase("tr")));
        const added = source.filter((a) => !existing.has(a.label?.tr?.trim().toLocaleLowerCase("tr")));

        if (added.length === 0) {
            toast.info("Bu olanaklar zaten detay listesinde.");
            return;
        }

        setForm((f) => ({ ...f, detailedAmenities: [...f.detailedAmenities, ...added.map((a) => ({ ...a }))] }));
        toast.success(`${added.length} olanak detay listesine eklendi.`);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        setErrors({});

        const trimmedSlug = form.slug.trim();

        const body = {
            // Boş bırakılırsa backend addan üretir
            slug: trimmedSlug || null,
            regionId: form.regionId || null,
            title: cleanLocalized(form.title),
            description: cleanLocalized(form.description),
            longDescription: cleanLocalized(form.longDescription),
            location: cleanLocalized(form.location),
            image: form.image,
            gallery: form.gallery,
            breakfastIncluded: form.breakfastIncluded,
            breakfastNote: cleanLocalized(form.breakfastNote),
            breakfastCard:
                form.breakfastCardOn && form.breakfastTitle?.tr?.trim()
                    ? {
                        title: cleanLocalized(form.breakfastTitle),
                        image: form.breakfastImage,
                        description: cleanLocalized(form.breakfastDescription),
                        tags: form.breakfastTags.filter((t) => t?.tr?.trim()).map(cleanLocalized),
                    }
                    : null,
            capacity: cleanLocalized(form.capacity),
            amenities: cleanSpecs(form.amenities),
            featureStrip: form.featureStrip
                .filter((f) => f.label?.tr?.trim())
                .map((f) => ({
                    icon: f.icon?.trim() ?? "",
                    label: cleanLocalized(f.label),
                    sub: cleanLocalized(f.sub),
                    tone: f.tone || null,
                })),
            detailedAmenities: cleanSpecs(form.detailedAmenities),
            distances: form.distances
                .filter((d) => d.place?.tr?.trim())
                .map((d) => ({ place: cleanLocalized(d.place), value: cleanLocalized(d.value) })),
            locationNote: cleanLocalized(form.locationNote),
            rules: form.rules
                .filter((r) => r.title?.tr?.trim())
                .map((r) => ({
                    icon: r.icon?.trim() ?? "",
                    title: cleanLocalized(r.title),
                    text: cleanLocalized(r.text),
                })),
            ratingLabel: null, // puan gösterilmiyor
            ratingScore: null,
            ratingCount: null,
            seoTitle: cleanLocalized(form.seoTitle),
            seoDescription: cleanLocalized(form.seoDescription),
            seoKeywords: cleanLocalized(form.seoKeywords),
            ogImage: form.image, // paylaşımda kapak görseli kullanılır
            defaultPricePerNight: Number(form.defaultPricePerNight) || 0,
            currency: form.currency,
            isFeatured: form.isFeatured,
            isActive: form.isActive,
            orderIndex: Number(form.orderIndex) || 0,
        };

        try {
            if (isNew) await adminPost("/admin/bungalows", body);
            else await adminPut(`/admin/bungalows/${record.id}`, body);

            toast.success(isCopy ? "Bungalov kopyalandı." : isNew ? "Bungalov eklendi." : "Değişiklikler kaydedildi.");
            router.push("/admin/bungalovlar");
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
        { name: "title", label: "Tesis adı", value: form.title, set: set("title") },
        { name: "description", label: "Kart açıklaması", value: form.description, set: set("description") },
        { name: "longDescription", label: "Detaylı açıklama", value: form.longDescription, set: set("longDescription") },
        { name: "location", label: "Konum", value: form.location, set: set("location") },
        { name: "capacity", label: "Kapasite", value: form.capacity, set: set("capacity") },
        { name: "locationNote", label: "Konum notu", value: form.locationNote, set: set("locationNote") },
        { name: "seoTitle", label: "SEO başlığı", value: form.seoTitle, set: set("seoTitle") },
        { name: "seoDescription", label: "SEO açıklaması", value: form.seoDescription, set: set("seoDescription") },
    ];

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {/* Başlık */}
            <div className="flex items-start gap-3">
                <Link
                    href="/admin/bungalovlar"
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px]" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {isCopy ? "Bungalov Kopyala" : isNew ? "Yeni Bungalov" : form.title.tr || "Bungalov Düzenle"}
                    </h1>
                    <p className="mt-1 text-sm text-ad-muted">
                        {isCopy
                            ? "Mevcut bir tesisin kopyasından önceden dolduruldu. Kaydedince yeni bir tesis oluşur."
                            : isNew
                                ? "Zorunlu alanlar: ad, gecelik fiyat."
                                : `Adres: /bungalov-konaklama/${record.slug}`}
                    </p>
                </div>
            </div>

            {isCopy && (
                <div className="flex items-start gap-3 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 py-3">
                    <Icon name="content_copy" className="mt-0.5 shrink-0 text-[20px] text-ad-brand" />
                    <div className="min-w-0 text-sm text-ad-body">
                        <strong className="font-semibold">Bu bir kopya.</strong> Kaydettiğinizde{" "}
                        <strong>yeni bir tesis</strong> oluşturulur; orijinal tesis etkilenmez. Kopya{" "}
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
                        label="Tesis Adı"
                        required
                        hint={isNew ? "Sitedeki adres bu addan otomatik oluşturulur." : undefined}
                        maxLength={150}
                        value={form.title}
                        onChange={set("title")}
                        errors={flatErrors}
                        translateHint="Tesis adı, özel isimler çevrilmez"
                    />
                </div>

                {/* URL / Slug — tek dilli */}
                <div className="sm:col-span-2">
                    <Field
                        label="Bağlantı Adresi (URL)"
                        hint={
                            isCopy
                                ? "Kopyada boş bırakırsanız addan yeni adres üretilir: /bungalov-konaklama/<adres>"
                                : "Sitede bu tesisin adresi: /bungalov-konaklama/<adres>"
                        }
                        error={fieldError("slug")}
                    >
                        <div className="flex items-stretch gap-2">
                            <span className="flex shrink-0 items-center rounded-xl bg-ad-sunken px-3 text-sm text-ad-muted">
                                /bungalov-konaklama/
                            </span>
                            <input
                                type="text"
                                value={form.slug}
                                placeholder="Boş bırakılırsa tesis adından üretilir"
                                maxLength={150}
                                onChange={(e) => set("slug")(e.target.value)}
                                className="h-11 w-full rounded-xl border border-ad-line bg-surface-white px-3 text-sm text-ad-ink outline-none transition-colors focus:border-ad-brand"
                            />
                        </div>
                    </Field>
                </div>

                <Field label="Bölge" error={fieldError("regionId")}>
                    <SelectInput value={form.regionId} onChange={(e) => set("regionId")(e.target.value)}>
                        <option value="">Bölge seçilmedi</option>
                        {regions.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.shortLabel?.tr}
                                {!r.isActive ? " (pasif)" : ""}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <div />

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="location"
                        label="Konum"
                        hint="Kartta görünür: Çamlıhemşin, Rize"
                        maxLength={150}
                        value={form.location}
                        onChange={set("location")}
                        errors={flatErrors}
                        translateHint="Yer adı, sadece gerekirse uyarlanmalı"
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="capacity"
                        label="Kapasite"
                        hint="Serbest metin: 4 misafir, 2 yatak odası"
                        maxLength={50}
                        value={form.capacity}
                        onChange={set("capacity")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="description"
                        label="Kart Açıklaması"
                        hint="Listede tesis adının altında görünen bir iki cümle"
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
                        hint="Detay sayfasındaki ana metin. Düz yazabilirsiniz: boş satır bıraktığınızda yeni paragraf olur, emoji kullanabilirsiniz."
                        multiline
                        rows={8}
                        value={form.longDescription}
                        onChange={set("longDescription")}
                        errors={flatErrors}
                    />
                </div>
            </FormSection>

            {/* GÖRSELLER */}
            <FormSection
                title="Görseller"
                description="Kapak görseli listelerde ve bağlantı paylaşımlarında kullanılır."
                columns={1}
            >
                <MediaPicker
                    label="Kapak Görseli"
                    category="Bungalow"
                    error={fieldError("image")}
                    value={form.image}
                    onChange={set("image")}
                />
                <MediaPicker
                    label="Galeri"
                    multiple
                    category="Bungalow"
                    hint="Detay sayfasındaki fotoğraflar. Seçili bir görsele tekrar tıklarsanız listeden çıkar."
                    value={form.gallery}
                    onChange={set("gallery")}
                />
            </FormSection>

            {/* FİYAT */}
            <FormSection title="Fiyat" columns={2}>
                <Field
                    label="Gecelik Fiyat"
                    required
                    hint="Bungalov başına, kişi sayısından bağımsız"
                    error={fieldError("defaultPricePerNight")}
                >
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.defaultPricePerNight}
                        error={fieldError("defaultPricePerNight")}
                        onChange={(e) => set("defaultPricePerNight")(e.target.value)}
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

                <div className="sm:col-span-2">
                    <p className="rounded-xl bg-ad-sunken px-3.5 py-3 text-xs text-ad-muted">
                        Sezonluk fiyatlar için{" "}
                        <Link href="/admin/fiyat-kurallari" className="font-semibold text-ad-brand hover:underline">
                            Dönemsel Fiyatlar
                        </Link>
                        , çocuk ek ücretleri için{" "}
                        <Link href="/admin/yas-fiyatlari" className="font-semibold text-ad-brand hover:underline">
                            Yaş Fiyatları
                        </Link>{" "}
                        sayfasını kullanın.
                    </p>
                </div>
            </FormSection>

            {/* KAHVALTI */}
            <FormSection title="Kahvaltı" columns={1}>
                <Switch
                    label="Kahvaltı dahil"
                    hint="Kartta ve fiyat dökümünde 'ücretsiz' olarak görünür"
                    checked={form.breakfastIncluded}
                    onChange={set("breakfastIncluded")}
                />

                <LocalizedField
                    name="breakfastNote"
                    label="Kısa Not"
                    hint="Kahvaltı kartı yoksa bu metin gösterilir"
                    maxLength={200}
                    value={form.breakfastNote}
                    onChange={set("breakfastNote")}
                    errors={flatErrors}
                />

                <Switch
                    label="Kahvaltı tanıtım kartı kullanılsın"
                    hint="Görselli, etiketli ayrı bölüm"
                    checked={form.breakfastCardOn}
                    onChange={set("breakfastCardOn")}
                />

                {form.breakfastCardOn && (
                    <div className="flex flex-col gap-4 rounded-xl border border-ad-line p-3">
                        <LocalizedField
                            name="breakfastTitle"
                            label="Başlık"
                            maxLength={100}
                            value={form.breakfastTitle}
                            onChange={set("breakfastTitle")}
                        />
                        <LocalizedField
                            name="breakfastDescription"
                            label="Açıklama"
                            multiline
                            rows={3}
                            maxLength={400}
                            value={form.breakfastDescription}
                            onChange={set("breakfastDescription")}
                        />
                        <MediaPicker
                            label="Kahvaltı Görseli"
                            category="Bungalow"
                            value={form.breakfastImage}
                            onChange={set("breakfastImage")}
                        />
                        <LocalizedListField
                            label="Etiketler"
                            hint="Organik, yerel üretim, serpme gibi"
                            maxLength={40}
                            max={8}
                            namePrefix="bftag"
                            addLabel="Etiket ekle"
                            value={form.breakfastTags}
                            onChange={set("breakfastTags")}
                        />
                    </div>
                )}
            </FormSection>

            {/* OLANAKLAR */}
            <FormSection
                title="Olanaklar"
                description="Kart etiketleri listelerde, detay olanakları tesis sayfasında görünür."
                columns={1}
            >
                <RepeaterField
                    label="Kart Etiketleri"
                    hint="Listede en fazla üçü görünür: Şömine, Jakuzi, Nehir manzarası"
                    max={8}
                    value={form.amenities}
                    onChange={set("amenities")}
                    emptyItem={emptySpec}
                    summary={(item) => item.label?.tr}
                    addLabel="Etiket ekle"
                    renderRow={(item, update) => <SpecRow item={item} update={update} valueLabel="Detay" />}
                />

                {form.amenities.length > 0 && (
                    <button
                        type="button"
                        onClick={copyAmenities}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 text-sm font-bold text-ad-brand transition-colors hover:brightness-95"
                    >
                        <Icon name="content_copy" className="text-[18px]" />
                        Kart etiketlerini detay listesine kopyala
                    </button>
                )}

                <RepeaterField
                    label="Detay Sayfası Olanakları"
                    hint="Her biri ikon, başlık ve açıklamayla"
                    max={20}
                    value={form.detailedAmenities}
                    onChange={set("detailedAmenities")}
                    emptyItem={emptySpec}
                    summary={(item) => item.label?.tr}
                    addLabel="Olanak ekle"
                    renderRow={(item, update) => <SpecRow item={item} update={update} valueLabel="Açıklama" />}
                />

                <RepeaterField
                    label="Özellik Şeridi"
                    hint="Galerinin altındaki altı kutuluk şerit: kapasite, yatak, banyo"
                    max={6}
                    value={form.featureStrip}
                    onChange={set("featureStrip")}
                    emptyItem={emptyFeature}
                    summary={(item) => item.label?.tr}
                    addLabel="Özellik ekle"
                    renderRow={(item, update) => (
                        <>
                            <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="king_bed" />
                            <Field label="Renk">
                                <SelectInput value={item.tone} onChange={(e) => update({ tone: e.target.value })}>
                                    <option value="">Kırmızı</option>
                                    <option value="emerald">Yeşil</option>
                                </SelectInput>
                            </Field>
                            <LocalizedField
                                name="fs-label"
                                label="Başlık"
                                maxLength={40}
                                value={item.label}
                                onChange={(v) => update({ label: v })}
                            />
                            <LocalizedField
                                name="fs-sub"
                                label="Alt Metin"
                                maxLength={40}
                                value={item.sub}
                                onChange={(v) => update({ sub: v })}
                            />
                        </>
                    )}
                />
            </FormSection>

            {/* KONUM */}
            <FormSection title="Konum ve mesafeler" columns={1}>
                <LocalizedField
                    name="locationNote"
                    label="Konum Notu"
                    hint="Detay sayfasında mesafelerin üstünde görünür"
                    multiline
                    rows={3}
                    maxLength={500}
                    value={form.locationNote}
                    onChange={set("locationNote")}
                    errors={flatErrors}
                />

                <RepeaterField
                    label="Mesafeler"
                    hint="Ayder Yaylası · 5 dk gibi"
                    max={8}
                    value={form.distances}
                    onChange={set("distances")}
                    emptyItem={emptyDistance}
                    summary={(item) => [item.place?.tr, item.value?.tr].filter(Boolean).join(" · ")}
                    addLabel="Mesafe ekle"
                    renderRow={(item, update) => (
                        <>
                            <LocalizedField
                                name="dist-place"
                                label="Yer"
                                maxLength={60}
                                value={item.place}
                                onChange={(v) => update({ place: v })}
                                translateHint="Yer adı"
                            />
                            <LocalizedField
                                name="dist-value"
                                label="Mesafe"
                                maxLength={30}
                                value={item.value}
                                onChange={(v) => update({ value: v })}
                                translateHint="Süre veya mesafe: 5 dk, 12 km"
                            />
                        </>
                    )}
                />
            </FormSection>

            {/* KURALLAR */}
            <FormSection title="Giriş ve iptal kuralları" columns={1}>
                <RepeaterField
                    label="Kurallar"
                    hint="Giriş saati, çıkış saati, evcil hayvan, iptal politikası"
                    max={10}
                    value={form.rules}
                    onChange={set("rules")}
                    emptyItem={emptyRule}
                    summary={(item) => item.title?.tr}
                    addLabel="Kural ekle"
                    renderRow={(item, update) => (
                        <>
                            <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="schedule" />
                            <div />
                            <LocalizedField
                                name="rule-title"
                                label="Başlık"
                                maxLength={80}
                                value={item.title}
                                onChange={(v) => update({ title: v })}
                            />
                            <LocalizedField
                                name="rule-text"
                                label="Açıklama"
                                multiline
                                rows={3}
                                maxLength={400}
                                value={item.text}
                                onChange={(v) => update({ text: v })}
                            />
                        </>
                    )}
                />
            </FormSection>

            {/* SEO */}
            <FormSection title="Arama motoru" columns={1}>
                <p className="rounded-xl bg-ad-sunken px-4 py-3 text-xs leading-relaxed text-ad-muted">
                    Bu alanlar Google sonuçlarında ve bağlantı paylaşımlarında görünür.
                    <br />
                    <strong className="text-ad-body">Sayfa başlığını</strong> boş bırakırsanız tesis adı kullanılır.
                    <br />
                    <strong className="text-ad-body">Açıklamayı</strong> boş bırakırsanız kart açıklaması kullanılır.
                    <br />
                    Paylaşım görseli olarak her zaman kapak görseli kullanılır.
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
            </FormSection>

            {/* YAYIN */}
            <FormSection title="Yayın" columns={2}>
                <Switch label="Yayında" hint="Kapalıyken sitede görünmez" checked={form.isActive} onChange={set("isActive")} />
                <Switch
                    label="Öne çıkan"
                    hint="Ana sayfada ve bölge kartında gösterilir"
                    checked={form.isFeatured}
                    onChange={set("isFeatured")}
                />
            </FormSection>

            <FormActions
                busy={busy}
                onCancel={() => router.push("/admin/bungalovlar")}
                saveLabel={isCopy ? "Kopyayı Oluştur" : isNew ? "Oluştur" : "Kaydet"}
                extra={<TranslateAllButton fields={translatable} />}
            />
        </form>
    );
}

/* ── Alt bileşenler ── */

function SpecRow({ item, update, valueLabel = "Değer" }) {
    return (
        <>
            <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="fireplace" />
            <div />
            <LocalizedField
                name="spec-label"
                label="Başlık"
                maxLength={60}
                value={item.label}
                onChange={(v) => update({ label: v })}
            />
            <LocalizedField
                name="spec-value"
                label={valueLabel}
                maxLength={100}
                value={item.value}
                onChange={(v) => update({ value: v })}
            />
        </>
    );
}