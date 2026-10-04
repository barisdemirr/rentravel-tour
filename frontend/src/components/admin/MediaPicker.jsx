"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/admin/Toast";
import { adminGet, adminUpload } from "@/lib/admin/client";
import { mediaUrl } from "@/lib/media";
import { Field } from "./fields";

/**
 * Tek görsel (multiple=false) veya galeri (multiple=true) seçer.
 * Değer backend'in MediaItem biçimi: { id, url, alt, order }
 */
export default function MediaPicker({ label, value, onChange, multiple = false, hint, error, category }) {
    const [open, setOpen] = useState(false);
    const items = multiple ? value ?? [] : value ? [value] : [];

    const pick = (asset) => {
        const item = { id: asset.id, url: asset.urls.original, alt: asset.altText ?? null, order: 0 };
        if (multiple) {
            if ((value ?? []).some((v) => v.id === asset.id)) return;
            onChange([...(value ?? []), { ...item, order: (value ?? []).length }]);
        } else {
            onChange(item);
            setOpen(false);
        }
    };

    const remove = (id) => {
        if (multiple) {
            onChange((value ?? []).filter((v) => v.id !== id).map((v, i) => ({ ...v, order: i })));
        } else {
            onChange(null);
        }
    };

    const move = (index, delta) => {
        const list = [...(value ?? [])];
        const target = index + delta;
        if (target < 0 || target >= list.length) return;
        [list[index], list[target]] = [list[target], list[index]];
        onChange(list.map((v, i) => ({ ...v, order: i })));
    };

    return (
        <Field label={label} hint={hint} error={error}>
            <div className="flex flex-wrap gap-2.5">
                {items.map((item, i) => (
                    <div
                        key={item.id}
                        className="group relative h-24 w-32 overflow-hidden rounded-xl border border-ad-line bg-ad-sunken"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={mediaUrl(item, "thumb")} alt="" className="h-full w-full object-cover" />

                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-ad-ink/60 opacity-0 transition-opacity group-hover:opacity-100">
                            {multiple && (
                                <>
                                    <IconBtn icon="chevron_left" label="Sola al" onClick={() => move(i, -1)} />
                                    <IconBtn icon="chevron_right" label="Sağa al" onClick={() => move(i, 1)} />
                                </>
                            )}
                            <IconBtn icon="delete" label="Kaldır" danger onClick={() => remove(item.id)} />
                        </div>

                        {multiple && i === 0 && (
                            <span className="absolute start-1.5 top-1.5 rounded-md bg-ad-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                                Kapak
                            </span>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="flex h-24 w-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-ad-line-strong bg-ad-sunken text-ad-muted transition-colors hover:border-ad-brand hover:bg-ad-brand-soft hover:text-ad-brand"
                >
                    <Icon name="add_photo_alternate" className="text-[24px]" />
                    <span className="text-xs font-semibold">{items.length > 0 ? "Ekle" : "Görsel seç"}</span>
                </button>
            </div>

            {open && (
                <MediaBrowser
                    category={category}
                    selectedIds={items.map((i) => i.id)}
                    onPick={pick}
                    onClose={() => setOpen(false)}
                />
            )}
        </Field>
    );
}

function IconBtn({ icon, label, onClick, danger }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors ${danger ? "hover:bg-ad-brand" : "hover:bg-white/20"
                }`}
        >
            <Icon name={icon} className="text-[17px]" />
        </button>
    );
}

/* ── Kütüphane penceresi ── */
function MediaBrowser({ category, selectedIds, onPick, onClose }) {
    const toast = useToast();
    const [assets, setAssets] = useState(null);
    const [query, setQuery] = useState("");
    const [uploading, setUploading] = useState(false);

    const load = async () => {
        try {
            const data = await adminGet("/admin/media");
            setAssets(Array.isArray(data) ? data : data?.items ?? []);
        } catch (e) {
            toast.error(e.message);
            setAssets([]);
        }
    };

    useEffect(() => {
        load();
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const upload = async (files) => {
        if (!files?.length) return;
        setUploading(true);

        try {
            for (const file of files) {
                const form = new FormData();
                form.append("file", file);
                if (category) form.append("category", category);
                await adminUpload("/admin/media", form);
            }
            toast.success(`${files.length} görsel yüklendi.`);
            await load();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
        } finally {
            setUploading(false);
        }
    };

    const visible = (assets ?? []).filter((a) =>
        query.trim() ? a.fileName?.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")) : true
    );

    return (
        <div className="fixed inset-0 z-[66] flex items-end justify-center bg-ad-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-6">
            <div
                role="dialog"
                aria-modal="true"
                className="flex h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-ad-line bg-ad-surface shadow-ad-lg sm:h-[80dvh] sm:rounded-2xl"
            >
                <div className="flex shrink-0 items-center gap-3 border-b border-ad-line px-4 py-3">
                    <h2 className="text-sm font-bold">Medya Kütüphanesi</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Kapat"
                        className="ms-auto flex h-9 w-9 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                    >
                        <Icon name="close" className="text-[20px]" />
                    </button>
                </div>

                <div className="flex shrink-0 flex-col gap-2 border-b border-ad-line px-4 py-3 sm:flex-row sm:items-center">
                    <span className="relative block flex-1">
                        <Icon
                            name="search"
                            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[18px] text-ad-muted"
                        />
                        <input
                            type="search"
                            placeholder="Dosya adında ara"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="ad-field ps-10"
                        />
                    </span>

                    <label className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-ad-ink px-5 text-sm font-bold text-white transition-colors hover:brightness-125">
                        <Icon
                            name={uploading ? "progress_activity" : "upload"}
                            className={`text-[18px] ${uploading ? "animate-spin" : ""}`}
                        />
                        {uploading ? "Yükleniyor" : "Yükle"}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            disabled={uploading}
                            onChange={(e) => {
                                upload(Array.from(e.target.files ?? []));
                                e.target.value = "";
                            }}
                            className="hidden"
                        />
                    </label>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {assets === null ? (
                        <div className="flex h-full items-center justify-center text-ad-muted">
                            <Icon name="progress_activity" className="animate-spin text-[28px]" />
                        </div>
                    ) : visible.length === 0 ? (
                        <p className="py-16 text-center text-sm text-ad-muted">
                            {query ? "Aramaya uygun görsel yok." : "Henüz görsel yüklenmemiş."}
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                            {visible.map((asset) => {
                                const selected = selectedIds.includes(asset.id);
                                return (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => onPick(asset)}
                                        className={`group relative aspect-square overflow-hidden rounded-xl border-2 bg-ad-sunken transition-all ${selected ? "border-ad-brand" : "border-transparent hover:border-ad-line-strong"
                                            }`}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={asset.urls.thumb}
                                            alt=""
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                        {selected && (
                                            <span className="absolute end-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ad-brand text-white">
                                                <Icon name="check" className="text-[15px]" />
                                            </span>
                                        )}
                                        <span className="absolute inset-x-0 bottom-0 truncate bg-ad-ink/70 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                                            {asset.fileName}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}