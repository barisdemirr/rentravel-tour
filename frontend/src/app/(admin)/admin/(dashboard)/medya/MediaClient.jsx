"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { EmptyState, PageHeader } from "@/components/admin/DataList";
import FormDialog from "@/components/admin/FormDialog";
import { useToast } from "@/components/admin/Toast";
import LocalizedField, { cleanLocalized, toLocalized } from "@/components/admin/LocalizedField";
import { Field, SelectInput, Switch } from "@/components/admin/fields";
import { adminDelete, adminPut, adminUpload } from "@/lib/admin/client";
import { assetUrl } from "@/lib/admin/media";

const CATEGORIES = [
    { value: "General", label: "Genel" },
    { value: "Vehicle", label: "Araç" },
    { value: "DailyTour", label: "Günübirlik Tur" },
    { value: "CultureTour", label: "Kültür Turu" },
    { value: "Bungalow", label: "Bungalov" },
];

const sizeOf = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / 1048576;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

export default function MediaClient({ assets, failed }) {
    const router = useRouter();
    const toast = useToast();
    const fileRef = useRef(null);

    const [category, setCategory] = useState("");
    const [query, setQuery] = useState("");
    const [uploadCategory, setUploadCategory] = useState("General");
    const [uploading, setUploading] = useState(0); // kalan dosya sayısı
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ alt: toLocalized(null), category: "General", isActive: true });
    const [busy, setBusy] = useState(false);
    const [target, setTarget] = useState(null);

    const visible = useMemo(() => {
        const q = query.trim().toLocaleLowerCase("tr");
        return assets.filter(
            (a) =>
                (!category || a.category === category) &&
                (!q ||
                    [a.fileName, a.altText?.tr].join(" ").toLocaleLowerCase("tr").includes(q))
        );
    }, [assets, category, query]);

    const upload = async (files) => {
        if (!files.length) return;

        setUploading(files.length);
        let done = 0;

        for (const file of files) {
            try {
                const data = new FormData();
                data.append("file", file);
                data.append("category", uploadCategory);
                await adminUpload("/admin/media", data);
                done += 1;
            } catch (e) {
                toast.error(`${file.name}: ${e.messages?.() ?? e.message}`);
            } finally {
                setUploading((n) => n - 1);
            }
        }

        if (done > 0) {
            toast.success(`${done} dosya yüklendi.`);
            router.refresh();
        }
    };

    const openEdit = (asset) => {
        setForm({
            alt: toLocalized(asset.altText),
            category: asset.category,
            isActive: asset.isActive,
        });
        setEditing(asset);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy) return;

        setBusy(true);
        try {
            await adminPut(`/admin/media/${editing.id}`, {
                category: form.category,
                altText: cleanLocalized(form.alt),
            });
            toast.success("Dosya bilgileri güncellendi.");
            setEditing(null);
            router.refresh();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        try {
            await adminDelete(`/admin/media/${target.id}`);
            toast.success("Dosya silindi.");
            setTarget(null);
            router.refresh();
        } catch (e) {
            // 409: dosya bir araç, tur veya bungalovda kullanılıyor
            toast.error(e.messages?.() ?? e.message);
            setTarget(null);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <PageHeader
                title="Medya Kütüphanesi"
                description="Tüm görseller. Yükleme sırasında üç boyut otomatik üretilir."
                action={
                    <div className="flex shrink-0 items-center gap-2">
                        <SelectInput value={uploadCategory} onChange={(e) => setUploadCategory(e.target.value)}>
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </SelectInput>
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={uploading > 0}
                            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110 disabled:opacity-60"
                        >
                            <Icon
                                name={uploading > 0 ? "progress_activity" : "upload"}
                                className={`text-[19px] ${uploading > 0 ? "animate-spin" : ""}`}
                            />
                            {uploading > 0 ? `Yükleniyor (${uploading})` : "Yükle"}
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                upload(Array.from(e.target.files ?? []));
                                e.target.value = "";
                            }}
                        />
                    </div>
                }
            />

            {/* Filtreler */}
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_200px]">
                <span className="relative block">
                    <Icon
                        name="search"
                        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[19px] text-ad-muted"
                    />
                    <input
                        type="search"
                        placeholder="Dosya adı veya alt metinde ara"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="ad-field ps-10"
                    />
                </span>

                <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Tüm kategoriler</option>
                    {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                            {c.label}
                        </option>
                    ))}
                </SelectInput>
            </div>

            {failed ? (
                <EmptyState icon="cloud_off" title="Veriler yüklenemedi" text="Sunucuya ulaşılamıyor." />
            ) : visible.length === 0 ? (
                <EmptyState
                    icon="photo_library"
                    title={query || category ? "Eşleşen dosya yok" : "Kütüphane boş"}
                    text={query || category ? "Filtreleri değiştirin." : "Yukarıdaki düğmeyle görsel yükleyin."}
                />
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {visible.map((asset) => (
                        <div key={asset.id} className="ad-card group overflow-hidden">
                            <div className="relative aspect-square bg-ad-sunken">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={assetUrl(asset, "thumb")}
                                    alt={asset.altText?.tr ?? ""}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />

                                {!asset.isActive && (
                                    <span className="absolute start-2 top-2 rounded-md bg-ad-ink/80 px-2 py-0.5 text-[10px] font-bold text-white">
                                        Pasif
                                    </span>
                                )}

                                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ad-ink/60 opacity-0 transition-opacity group-hover:opacity-100">
                                    <a
                                        href={assetUrl(asset, "original")}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Büyük boyutta aç"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/20"
                                    >
                                        <Icon name="open_in_full" className="text-[18px]" />
                                    </a>
                                    <button
                                        type="button"
                                        onClick={() => openEdit(asset)}
                                        title="Bilgileri düzenle"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/20"
                                    >
                                        <Icon name="edit" className="text-[18px]" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTarget(asset)}
                                        title="Sil"
                                        className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition-colors hover:bg-ad-brand"
                                    >
                                        <Icon name="delete" className="text-[18px]" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-2.5">
                                <p className="truncate text-xs font-semibold" title={asset.fileName}>
                                    {asset.fileName}
                                </p>
                                <p dir="ltr" className="mt-0.5 truncate text-[11px] text-ad-faint">
                                    {asset.width}×{asset.height} · {sizeOf(asset.fileSize)}
                                </p>
                                {!asset.altText?.tr && (
                                    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-ad-warn">
                                        <Icon name="warning" className="text-[12px]" />
                                        Alt metin yok
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <FormDialog
                open={Boolean(editing)}
                title="Dosya Bilgileri"
                description={editing?.fileName}
                busy={busy}
                onSubmit={submit}
                onClose={() => setEditing(null)}
            >
                <div className="sm:col-span-2">
                    <LocalizedField
                        name="alt"
                        label="Alt Metin"
                        hint="Görsel yüklenmezse gösterilir, arama motorları için de önemli"
                        maxLength={200}
                        value={form.alt}
                        onChange={(v) => setForm((f) => ({ ...f, alt: v }))}
                        translateHint="Görsel açıklaması, kısa ve betimleyici"
                    />
                </div>

                <div className="sm:col-span-2">
                    <Field label="Kategori">
                        <SelectInput
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </SelectInput>
                    </Field>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={Boolean(target)}
                title="Dosya silinsin mi?"
                message="Görsel sunucudan kalıcı olarak kaldırılır. Bir araç, tur veya bungalovda kullanılıyorsa silme işlemi reddedilir."
                onConfirm={remove}
                onCancel={() => setTarget(null)}
            />
        </div>
    );
}