"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { move, normalize } from "@/lib/admin/reorder";

/**
 * Tekrarlayan satır listesi. Her satırın içeriğini renderRow çizer.
 * value: dizi, onChange: (yeni dizi) => void
 * emptyItem: () => yeni satır nesnesi
 * summary: (item, index) => başlıkta görünen metin
 */
export default function RepeaterField({
    label,
    hint,
    value = [],
    onChange,
    emptyItem,
    renderRow,
    summary,
    addLabel = "Satır ekle",
    max = 20,
}) {
    const [open, setOpen] = useState(() => new Set());

    const toggle = (i) =>
        setOpen((s) => {
            const next = new Set(s);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });

    const update = (index, patch) =>
        onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

    const add = () => {
        onChange([...value, emptyItem()]);
        setOpen((s) => new Set(s).add(value.length)); // yeni satır açık gelsin
    };

    const remove = (index) => {
        onChange(value.filter((_, i) => i !== index));
        setOpen(new Set());
    };

    const shift = (index, delta) => {
        // normalize burada sadece sırayı sabitler, nesnelerde orderIndex yoksa zararsız
        onChange(move(value, index, delta));
        setOpen(new Set());
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <span className="text-xs font-semibold text-ad-body">{label}</span>
                    {hint && <p className="mt-0.5 text-xs text-ad-faint">{hint}</p>}
                </div>
                <span className="shrink-0 text-xs text-ad-faint">
                    {value.length}
                    {max ? ` / ${max}` : ""}
                </span>
            </div>

            {value.length > 0 && (
                <div className="flex flex-col gap-2">
                    {value.map((item, i) => {
                        const expanded = open.has(i);
                        return (
                            <div key={i} className="overflow-hidden rounded-xl border border-ad-line bg-ad-surface">
                                {/* Satır başlığı */}
                                <div className="flex items-center gap-1 bg-ad-sunken px-2 py-1.5">
                                    <button
                                        type="button"
                                        onClick={() => toggle(i)}
                                        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-start transition-colors hover:bg-ad-line/50"
                                    >
                                        <Icon
                                            name="expand_more"
                                            className={`shrink-0 text-[18px] text-ad-muted transition-transform ${expanded ? "rotate-180" : ""
                                                }`}
                                        />
                                        <span className="truncate text-sm font-semibold">
                                            {summary?.(item, i) || `${i + 1}. satır`}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => shift(i, -1)}
                                        disabled={i === 0}
                                        aria-label="Yukarı taşı"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-line/60 hover:text-ad-ink disabled:opacity-25"
                                    >
                                        <Icon name="keyboard_arrow_up" className="text-[18px]" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => shift(i, 1)}
                                        disabled={i === value.length - 1}
                                        aria-label="Aşağı taşı"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-line/60 hover:text-ad-ink disabled:opacity-25"
                                    >
                                        <Icon name="keyboard_arrow_down" className="text-[18px]" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remove(i)}
                                        aria-label="Satırı sil"
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-brand-soft hover:text-ad-brand"
                                    >
                                        <Icon name="delete" className="text-[17px]" />
                                    </button>
                                </div>

                                {expanded && (
                                    <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                                        {renderRow(item, (patch) => update(i, patch), i)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {value.length < max && (
                <button
                    type="button"
                    onClick={add}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-ad-line-strong text-sm font-semibold text-ad-muted transition-colors hover:border-ad-brand hover:bg-ad-brand-soft hover:text-ad-brand"
                >
                    <Icon name="add" className="text-[18px]" />
                    {addLabel}
                </button>
            )}
        </div>
    );
}

/** Çoklu seçim: araç ekstraları gibi katalog bağlantıları için */
export function MultiSelect({ label, hint, options, value = [], onChange, emptyText }) {
    const toggle = (id) =>
        onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);

    return (
        <div className="flex flex-col gap-2">
            <div>
                <span className="text-xs font-semibold text-ad-body">{label}</span>
                {hint && <p className="mt-0.5 text-xs text-ad-faint">{hint}</p>}
            </div>

            {options.length === 0 ? (
                <p className="rounded-xl bg-ad-sunken px-4 py-3 text-sm text-ad-muted">{emptyText}</p>
            ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {options.map((o) => {
                        const selected = value.includes(o.id);
                        return (
                            <button
                                key={o.id}
                                type="button"
                                role="checkbox"
                                aria-checked={selected}
                                onClick={() => toggle(o.id)}
                                className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-start transition-colors ${selected
                                        ? "border-ad-brand bg-ad-brand-soft"
                                        : "border-ad-line bg-ad-surface hover:border-ad-line-strong"
                                    }`}
                            >
                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${selected ? "border-ad-brand bg-ad-brand text-white" : "border-ad-line-strong"
                                        }`}
                                >
                                    {selected && <Icon name="check" className="text-[13px]" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">{o.label}</span>
                                    {o.sub && <span className="block truncate text-xs text-ad-muted">{o.sub}</span>}
                                </span>
                                {o.icon && <Icon name={o.icon} className="shrink-0 text-[18px] text-ad-muted" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}