"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import IconField from "@/components/admin/IconField";
import MediaPicker from "@/components/admin/MediaPicker";
import RepeaterField, { MultiSelect } from "@/components/admin/RepeaterField";
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

/** Dizi satırlarının boş şablonları */
const emptySpec = () => ({ icon: "", label: emptyLocalized(), value: emptyLocalized() });
const emptyRequirement = () => ({
    label: emptyLocalized(),
    value: emptyLocalized(),
    sub: emptyLocalized(),
    highlight: false,
});
const emptyBlock = () => ({
    icon: "",
    label: emptyLocalized(),
    title: emptyLocalized(),
    description: emptyLocalized(),
});

const toSpec = (s) => ({ icon: s.icon ?? "", label: toLocalized(s.label), value: toLocalized(s.value) });
const toBlock = (b) =>
    b
        ? {
            icon: b.icon ?? "",
            label: toLocalized(b.label),
            title: toLocalized(b.title),
            description: toLocalized(b.description),
        }
        : null;

function initialState(record, nextOrder) {
    return {
        slug: record?.slug ?? "",
        name: toLocalized(record?.name),
        segmentId: record?.segment?.id ?? "",
        tagline: toLocalized(record?.tagline),
        description: toLocalized(record?.description),
        guarantee: toLocalized(record?.guarantee),
        image: record?.image ?? null,
        specs: (record?.specs ?? []).map(toSpec),
        detailedSpecs: (record?.detailedSpecs ?? []).map(toSpec),
        delivery: toBlock(record?.delivery),
        office: toBlock(record?.office),
        driverRequirements: (record?.driverRequirements ?? []).map((r) => ({
            label: toLocalized(r.label),
            value: toLocalized(r.value),
            sub: toLocalized(r.sub),
            highlight: Boolean(r.highlight),
        })),
        extraIds: (record?.extras ?? []).map((e) => e.extraId),
        defaultDailyPrice: record?.defaultDailyPrice ?? "",
        currency: record?.currency ?? "TRY",
        deposit: record?.deposit ?? "",
        kmLimit: record?.kmLimit ?? "",
        extraKmPrice: record?.extraKmPrice ?? "",
        seoTitle: toLocalized(record?.seoTitle),
        seoDescription: toLocalized(record?.seoDescription),
        seoKeywords: toLocalized(record?.seoKeywords),
        isFeatured: record?.isFeatured ?? false,
        isActive: record?.isActive ?? true,
        orderIndex: record?.orderIndex ?? nextOrder,
    };
}

/** Dizi satırındaki boş çok dilli alanları temizler, tamamen boş satırları atar */
const cleanSpecs = (list) =>
    list
        .filter((s) => s.label?.tr?.trim() || s.value?.tr?.trim())
        .map((s) => ({ icon: s.icon?.trim() ?? "", label: cleanLocalized(s.label), value: cleanLocalized(s.value) }));

export default function VehicleForm({ record, isCopy = false, segments, extras, nextOrder }) {
    const router = useRouter();
    const toast = useToast();
    const isNew = !record?.id;

    const [form, setForm] = useState(() => initialState(record, nextOrder));
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);

    const set = (name) => (value) => setForm((f) => ({ ...f, [name]: value }));
    const fieldError = (name) => errors[name]?.[0] ?? errors[`${name}.tr`]?.[0] ?? null;
    const flatErrors = Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v[0]]));

    /* Kart özelliklerini detay listesine kopyala */
    const copySpecsToDetailed = () => {
        const source = form.specs.filter((s) => s.label?.tr?.trim() || s.value?.tr?.trim());

        if (source.length === 0) {
            toast.error("Önce kart özelliklerini doldurun.");
            return;
        }

        // Aynı etiketten ikinci kez eklenmesin
        const existing = new Set(form.detailedSpecs.map((s) => s.label?.tr?.trim().toLocaleLowerCase("tr")));
        const added = source.filter((s) => !existing.has(s.label?.tr?.trim().toLocaleLowerCase("tr")));

        if (added.length === 0) {
            toast.info("Bu özellikler zaten detay listesinde.");
            return;
        }

        setForm((f) => ({ ...f, detailedSpecs: [...f.detailedSpecs, ...added.map((s) => ({ ...s }))] }));
        toast.success(`${added.length} özellik detay listesine eklendi.`);
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
            segmentId: form.segmentId || null,
            name: cleanLocalized(form.name),
            tagline: cleanLocalized(form.tagline),
            description: cleanLocalized(form.description),
            guarantee: cleanLocalized(form.guarantee),
            badge: null, // site tarafında kullanılmıyor
            badgeTone: null,
            rating: null, // araç puanı sitede gösterilmiyor
            image: form.image,
            gallery: [], // araçlarda galeri yok, tek ana görsel
            specs: cleanSpecs(form.specs),
            detailedSpecs: cleanSpecs(form.detailedSpecs),
            delivery: form.delivery?.title?.tr?.trim()
                ? {
                    icon: form.delivery.icon?.trim() ?? "",
                    label: cleanLocalized(form.delivery.label),
                    title: cleanLocalized(form.delivery.title),
                    description: cleanLocalized(form.delivery.description),
                }
                : null,
            office: form.office?.title?.tr?.trim()
                ? {
                    icon: form.office.icon?.trim() ?? "",
                    label: cleanLocalized(form.office.label),
                    title: cleanLocalized(form.office.title),
                    description: cleanLocalized(form.office.description),
                }
                : null,
            driverRequirements: form.driverRequirements
                .filter((r) => r.label?.tr?.trim())
                .map((r) => ({
                    label: cleanLocalized(r.label),
                    value: cleanLocalized(r.value),
                    sub: cleanLocalized(r.sub),
                    highlight: Boolean(r.highlight),
                })),
            extraIds: form.extraIds,
            deposit: Number(form.deposit) || 0,
            kmLimit: form.kmLimit === "" ? null : Number(form.kmLimit),
            extraKmPrice: form.extraKmPrice === "" ? null : Number(form.extraKmPrice),
            seoTitle: cleanLocalized(form.seoTitle),
            seoDescription: cleanLocalized(form.seoDescription),
            seoKeywords: cleanLocalized(form.seoKeywords),
            ogImage: form.image, // paylaşımda ana görsel kullanılır
            defaultDailyPrice: Number(form.defaultDailyPrice) || 0,
            currency: form.currency,
            isFeatured: form.isFeatured,
            isActive: form.isActive,
            orderIndex: Number(form.orderIndex) || 0,
        };

        try {
            if (isNew) await adminPost("/admin/vehicles", body);
            else await adminPut(`/admin/vehicles/${record.id}`, body);

            toast.success(isCopy ? "Araç kopyalandı." : isNew ? "Araç eklendi." : "Değişiklikler kaydedildi.");
            router.push("/admin/araclar");
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

    /* Toplu çeviri için ana metin alanları */
    const translatable = [
        { name: "name", label: "Araç adı", value: form.name, set: set("name") },
        { name: "tagline", label: "Kısa açıklama", value: form.tagline, set: set("tagline") },
        { name: "description", label: "Detaylı açıklama", value: form.description, set: set("description") },
        { name: "guarantee", label: "Garanti metni", value: form.guarantee, set: set("guarantee") },
        { name: "seoTitle", label: "SEO başlığı", value: form.seoTitle, set: set("seoTitle") },
        { name: "seoDescription", label: "SEO açıklaması", value: form.seoDescription, set: set("seoDescription") },
    ];

    return (
        <form onSubmit={submit} className="mx-auto flex w-full max-w-4xl flex-col gap-5">
            {/* Başlık */}
            <div className="flex items-start gap-3">
                <Link
                    href="/admin/araclar"
                    aria-label="Listeye dön"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ad-line text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                >
                    <Icon name="arrow_back" className="text-[20px]" />
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                        {isCopy ? "Araç Kopyala" : isNew ? "Yeni Araç" : form.name.tr || "Araç Düzenle"}
                    </h1>
                    <p className="mt-1 text-sm text-ad-muted">
                        {isCopy
                            ? "Mevcut bir aracın kopyasından önceden dolduruldu. Kaydedince yeni bir araç oluşur."
                            : isNew
                                ? "Zorunlu alanlar: ad, günlük fiyat, depozito."
                                : `Adres: /arac-kiralama/${record.slug}`}
                    </p>
                </div>
            </div>

            {isCopy && (
                <div className="flex items-start gap-3 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 py-3">
                    <Icon name="content_copy" className="mt-0.5 shrink-0 text-[20px] text-ad-brand" />
                    <div className="min-w-0 text-sm text-ad-body">
                        <strong className="font-semibold">Bu bir kopya.</strong> Kaydettiğinizde{" "}
                        <strong>yeni bir araç</strong> oluşturulur; orijinal araç etkilenmez. Kopya{" "}
                        <strong>taslak</strong> olarak kaydedilir (yayında değil). Başlıktaki{" "}
                        <code className="rounded bg-ad-sunken px-1.5 py-0.5 text-xs">(Kopya)</code> ekini
                        düzenleyebilirsiniz.
                    </div>
                </div>
            )}

            {/* TEMEL BİLGİLER */}
            <FormSection title="Temel bilgiler" columns={2}>
                <div className="sm:col-span-2">
                    <LocalizedField
                        name="name"
                        label="Araç Adı"
                        required
                        hint={isNew ? "Sitedeki adres bu addan otomatik oluşturulur." : undefined}
                        maxLength={120}
                        value={form.name}
                        onChange={set("name")}
                        errors={flatErrors}
                        translateHint="Araç modeli, marka adları çevrilmez"
                    />
                </div>

                {/* URL / Slug — tek dilli */}
                <div className="sm:col-span-2">
                    <Field
                        label="Bağlantı Adresi (URL)"
                        hint={
                            isCopy
                                ? "Kopyada boş bırakırsanız addan yeni adres üretilir: /arac-kiralama/<adres>"
                                : "Sitede bu aracın adresi: /arac-kiralama/<adres>"
                        }
                        error={fieldError("slug")}
                    >
                        <div className="flex items-stretch gap-2">
                            <span className="flex shrink-0 items-center rounded-xl bg-ad-sunken px-3 text-sm text-ad-muted">
                                /arac-kiralama/
                            </span>
                            <input
                                type="text"
                                value={form.slug}
                                placeholder="Boş bırakılırsa araç adından üretilir"
                                maxLength={120}
                                onChange={(e) => set("slug")(e.target.value)}
                                className="h-11 w-full rounded-xl border border-ad-line bg-surface-white px-3 text-sm text-ad-ink outline-none transition-colors focus:border-ad-brand"
                            />
                        </div>
                    </Field>
                </div>

                <Field label="Segment" error={fieldError("segmentId")}>
                    <SelectInput
                        value={form.segmentId}
                        error={fieldError("segmentId")}
                        onChange={(e) => set("segmentId")(e.target.value)}
                    >
                        <option value="">Segment seçilmedi</option>
                        {segments.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label?.tr}
                                {!s.isActive ? " (pasif)" : ""}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <div />

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="tagline"
                        label="Kısa Açıklama"
                        hint="Kartta adın altında görünür"
                        maxLength={160}
                        value={form.tagline}
                        onChange={set("tagline")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="description"
                        label="Detaylı Açıklama"
                        hint="Detay sayfasındaki metin. Basit HTML kullanılabilir (p, ul, a)."
                        multiline
                        rows={6}
                        value={form.description}
                        onChange={set("description")}
                        errors={flatErrors}
                    />
                </div>

                <div className="sm:col-span-2">
                    <LocalizedField
                        name="guarantee"
                        label="Garanti Metni"
                        hint="Başlığın altında: Aynı sınıf araç garantisi"
                        maxLength={160}
                        value={form.guarantee}
                        onChange={set("guarantee")}
                        errors={flatErrors}
                    />
                </div>
            </FormSection>

            {/* GÖRSEL */}
            <FormSection
                title="Görsel"
                description="Araç listelerinde, detay sayfasında ve bağlantı paylaşımlarında bu görsel kullanılır."
                columns={1}
            >
                <MediaPicker
                    label="Araç Görseli"
                    category="Vehicle"
                    hint="Arka planı sade, aracın tamamının göründüğü bir fotoğraf tercih edin."
                    error={fieldError("image")}
                    value={form.image}
                    onChange={set("image")}
                />
            </FormSection>

            {/* FİYAT */}
            <FormSection title="Fiyat ve koşullar" columns={2}>
                <Field label="Günlük Fiyat" required error={fieldError("defaultDailyPrice")}>
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.defaultDailyPrice}
                        error={fieldError("defaultDailyPrice")}
                        onChange={(e) => set("defaultDailyPrice")(e.target.value)}
                    />
                </Field>

                <Field label="Para Birimi" required error={fieldError("currency")}>
                    <SelectInput value={form.currency} onChange={(e) => set("currency")(e.target.value)}>
                        {CURRENCIES.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </SelectInput>
                </Field>

                <Field label="Depozito" required error={fieldError("deposit")}>
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.deposit}
                        error={fieldError("deposit")}
                        onChange={(e) => set("deposit")(e.target.value)}
                    />
                </Field>

                <Field label="Km Limiti" hint="Günlük, boş bırakılırsa gösterilmez" error={fieldError("kmLimit")}>
                    <NumberInput
                        min="0"
                        step="1"
                        suffix="km"
                        value={form.kmLimit}
                        error={fieldError("kmLimit")}
                        onChange={(e) => set("kmLimit")(e.target.value)}
                    />
                </Field>

                <Field label="Aşım Ücreti" hint="Km başına" error={fieldError("extraKmPrice")}>
                    <NumberInput
                        min="0"
                        step="0.01"
                        value={form.extraKmPrice}
                        error={fieldError("extraKmPrice")}
                        onChange={(e) => set("extraKmPrice")(e.target.value)}
                    />
                </Field>

                <div className="flex items-end">
                    <p className="rounded-xl bg-ad-sunken px-3.5 py-3 text-xs text-ad-muted">
                        Sezonluk farklı fiyatlar için{" "}
                        <Link href="/admin/fiyat-kurallari" className="font-semibold text-ad-brand hover:underline">
                            Dönemsel Fiyatlar
                        </Link>{" "}
                        sayfasını kullanın.
                    </p>
                </div>
            </FormSection>

            {/* EKSTRALAR */}
            <FormSection title="Ekstra hizmetler" columns={1}>
                <MultiSelect
                    label="Bu araca eklenebilecek ekstralar"
                    hint="Fiyatlar seçildiği andaki katalog değerinden kopyalanır. Katalogda fiyat değişirse aracı tekrar kaydedin."
                    emptyText="Önce Katalog → Araç Ekstraları bölümünden ekstra tanımlayın."
                    options={extras.map((e) => ({
                        id: e.id,
                        label: e.title?.tr,
                        sub: `${e.dailyPrice} ${e.currency} / gün`,
                        icon: e.icon,
                    }))}
                    value={form.extraIds}
                    onChange={set("extraIds")}
                />
            </FormSection>

            {/* ÖZELLİKLER */}
            <FormSection
                title="Teknik özellikler"
                description="Kart özellikleri araç listelerinde, detay özellikleri araç sayfasında görünür."
                columns={1}
            >
                <RepeaterField
                    label="Kart Özellikleri"
                    hint="Araç kartında görünen 3-4 kısa bilgi"
                    max={6}
                    value={form.specs}
                    onChange={set("specs")}
                    emptyItem={emptySpec}
                    summary={(item) => item.label?.tr || item.value?.tr}
                    addLabel="Özellik ekle"
                    renderRow={(item, update) => <SpecRow item={item} update={update} />}
                />

                {/* Kopyalama: aynı bilgileri iki kez yazmaya gerek kalmasın */}
                {form.specs.length > 0 && (
                    <button
                        type="button"
                        onClick={copySpecsToDetailed}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ad-brand-line bg-ad-brand-soft px-4 text-sm font-bold text-ad-brand transition-colors hover:brightness-95"
                    >
                        <Icon name="content_copy" className="text-[18px]" />
                        Kart özelliklerini detay listesine kopyala
                    </button>
                )}

                <RepeaterField
                    label="Detay Sayfası Özellikleri"
                    hint="Yakıt, vites, bagaj, yolcu kapasitesi gibi"
                    max={12}
                    value={form.detailedSpecs}
                    onChange={set("detailedSpecs")}
                    emptyItem={emptySpec}
                    summary={(item) => item.label?.tr || item.value?.tr}
                    addLabel="Özellik ekle"
                    renderRow={(item, update) => <SpecRow item={item} update={update} />}
                />
            </FormSection>

            {/* SÜRÜCÜ */}
            <FormSection title="Sürücü gereksinimleri" description="Yaş, ehliyet süresi, kimlik gibi koşullar." columns={1}>
                <RepeaterField
                    label="Koşullar"
                    max={8}
                    value={form.driverRequirements}
                    onChange={set("driverRequirements")}
                    emptyItem={emptyRequirement}
                    summary={(item) => item.label?.tr}
                    addLabel="Koşul ekle"
                    renderRow={(item, update) => (
                        <>
                            <LocalizedField
                                name="req-label"
                                label="Başlık"
                                maxLength={60}
                                value={item.label}
                                onChange={(v) => update({ label: v })}
                                translateHint="Sürücü koşulu başlığı, kısa"
                            />
                            <LocalizedField
                                name="req-value"
                                label="Değer"
                                maxLength={60}
                                value={item.value}
                                onChange={(v) => update({ value: v })}
                                translateHint="Sürücü koşulu değeri: 25 yaş, 3 yıl gibi"
                            />
                            <LocalizedField
                                name="req-sub"
                                label="Alt Not"
                                maxLength={80}
                                value={item.sub}
                                onChange={(v) => update({ sub: v })}
                            />
                            <div className="flex items-end">
                                <Switch
                                    label="Vurgulu"
                                    hint="Alt not kırmızı gösterilir"
                                    checked={item.highlight}
                                    onChange={(v) => update({ highlight: v })}
                                />
                            </div>
                        </>
                    )}
                />
            </FormSection>

            {/* TESLİMAT */}
            <FormSection
                title="Teslimat ve ofis"
                description="Detay sayfasındaki iki bilgi kartı. Boş bırakılırsa gösterilmez."
                columns={1}
            >
                <BlockFields title="Teslimat Kartı" value={form.delivery} onChange={set("delivery")} prefix="delivery" />
                <BlockFields title="Ofis Kartı" value={form.office} onChange={set("office")} prefix="office" />
            </FormSection>

            {/* SEO */}
            <FormSection title="Arama motoru" columns={1}>
                <p className="rounded-xl bg-ad-sunken px-4 py-3 text-xs leading-relaxed text-ad-muted">
                    Bu alanlar Google sonuçlarında ve bağlantı paylaşımlarında görünür.
                    <br />
                    <strong className="text-ad-body">Sayfa başlığını</strong> boş bırakırsanız araç adı kullanılır.
                    <br />
                    <strong className="text-ad-body">Açıklamayı</strong> boş bırakırsanız kısa açıklama kullanılır.
                    <br />
                    Paylaşım görseli olarak her zaman yukarıdaki araç görseli kullanılır.
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
                <Switch
                    label="Yayında"
                    hint="Kapalıyken sitede görünmez"
                    checked={form.isActive}
                    onChange={set("isActive")}
                />
                <Switch
                    label="Öne çıkan"
                    hint="Ana sayfadaki araç bölümünde gösterilir"
                    checked={form.isFeatured}
                    onChange={set("isFeatured")}
                />
            </FormSection>

            <FormActions
                busy={busy}
                onCancel={() => router.push("/admin/araclar")}
                saveLabel={isCopy ? "Kopyayı Oluştur" : isNew ? "Oluştur" : "Kaydet"}
                extra={<TranslateAllButton fields={translatable} />}
            />
        </form>
    );
}

/* ── Alt bileşenler ── */

function SpecRow({ item, update }) {
    return (
        <>
            <IconField value={item.icon} onChange={(v) => update({ icon: v })} placeholder="local_gas_station" />
            <div />
            <LocalizedField
                name="spec-label"
                label="Etiket"
                maxLength={60}
                value={item.label}
                onChange={(v) => update({ label: v })}
                translateHint="Araç özelliği etiketi: Yakıt, Vites gibi"
            />
            <LocalizedField
                name="spec-value"
                label="Değer"
                maxLength={60}
                value={item.value}
                onChange={(v) => update({ value: v })}
                translateHint="Araç özelliği değeri: Dizel, Otomatik gibi"
            />
        </>
    );
}

function BlockFields({ title, value, onChange, prefix }) {
    if (!value) {
        return (
            <button
                type="button"
                onClick={() => onChange(emptyBlock())}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-ad-line-strong text-sm font-semibold text-ad-muted transition-colors hover:border-ad-brand hover:bg-ad-brand-soft hover:text-ad-brand"
            >
                <Icon name="add" className="text-[18px]" />
                {title} ekle
            </button>
        );
    }

    const update = (patch) => onChange({ ...value, ...patch });

    return (
        <div className="rounded-xl border border-ad-line p-3">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">{title}</span>
                <button
                    type="button"
                    onClick={() => onChange(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-brand-soft hover:text-ad-brand"
                    aria-label="Kartı kaldır"
                >
                    <Icon name="delete" className="text-[17px]" />
                </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <IconField value={value.icon} onChange={(v) => update({ icon: v })} placeholder="local_shipping" />
                <LocalizedField
                    name={`${prefix}-label`}
                    label="Üst Etiket"
                    maxLength={60}
                    value={value.label}
                    onChange={(v) => update({ label: v })}
                />
                <LocalizedField
                    name={`${prefix}-title`}
                    label="Başlık"
                    maxLength={80}
                    value={value.title}
                    onChange={(v) => update({ title: v })}
                />
                <LocalizedField
                    name={`${prefix}-desc`}
                    label="Açıklama"
                    multiline
                    rows={3}
                    maxLength={200}
                    value={value.description}
                    onChange={(v) => update({ description: v })}
                />
            </div>
        </div>
    );
}