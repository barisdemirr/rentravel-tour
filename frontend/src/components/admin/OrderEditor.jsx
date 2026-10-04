"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { useToast } from "@/components/admin/Toast";
import { changed, move, normalize } from "@/lib/admin/reorder";

/**
 * Sıralama modu: öğeleri taşı, kaydet.
 * rows: sıralı liste, renderItem(row) => JSX, onSave(değişenKayıtlar) => Promise
 */
export default function OrderEditor({ rows, renderItem, onSave, onCancel }) {
    const toast = useToast();
    const [list, setList] = useState(rows);
    const [busy, setBusy] = useState(false);
    const [focused, setFocused] = useState(null);

    const diff = changed(rows, list);
    const dirty = diff.length > 0;

    const shift = (index, delta) => {
        const moved = normalize(move(list, index, delta));
        setList(moved);
        // Taşınan öğeyi takip et, klavyeyle üst üste taşımak kolay olsun
        const item = list[index];
        setFocused(item.id);
    };

    const save = async () => {
        if (!dirty) {
            onCancel();
            return;
        }

        setBusy(true);
        try {
            await onSave(diff);
            toast.success(`Sıralama güncellendi (${diff.length} kayıt).`);
            onCancel();
        } catch (e) {
            toast.error(e.messages?.() ?? e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="flex items-start gap-2 rounded-xl border border-ad-line bg-ad-sunken px-4 py-3 text-xs text-ad-muted">
                <Icon name="info" className="mt-px shrink-0 text-[15px] text-ad-brand" />
                <span>
                    Öğeleri oklarla taşıyın. Üstteki sitede önce görünür. Kaydetmeden çıkarsanız değişiklikler
                    uygulanmaz.
                </span>
            </p>

            <ol className="ad-card divide-y divide-ad-line overflow-hidden">
                {list.map((row, i) => (
                    <li
                        key={row.id}
                        className={`flex items-center gap-2 p-2.5 transition-colors sm:gap-3 sm:p-3 ${focused === row.id ? "bg-ad-brand-soft/60" : ""
                            }`}
                    >
                        {/* Sıra numarası */}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ad-sunken text-xs font-bold text-ad-muted">
                            {i + 1}
                        </span>

                        <div className="min-w-0 flex-1">{renderItem(row)}</div>

                        {/* Taşıma düğmeleri */}
                        <div className="flex shrink-0 items-center gap-0.5">
                            <MoveButton
                                icon="keyboard_double_arrow_up"
                                label="En üste al"
                                disabled={i === 0}
                                onClick={() => shift(i, -Infinity)}
                                className="hidden sm:flex"
                            />
                            <MoveButton
                                icon="keyboard_arrow_up"
                                label="Yukarı taşı"
                                disabled={i === 0}
                                onClick={() => shift(i, -1)}
                            />
                            <MoveButton
                                icon="keyboard_arrow_down"
                                label="Aşağı taşı"
                                disabled={i === list.length - 1}
                                onClick={() => shift(i, 1)}
                            />
                            <MoveButton
                                icon="keyboard_double_arrow_down"
                                label="En alta al"
                                disabled={i === list.length - 1}
                                onClick={() => shift(i, Infinity)}
                                className="hidden sm:flex"
                            />
                        </div>
                    </li>
                ))}
            </ol>

            {/* İşlem çubuğu */}
            <div className="sticky bottom-0 z-10 -mx-3 flex items-center gap-2 border-t border-ad-line bg-ad-surface/90 px-3 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <span className="text-xs text-ad-muted">
                    {dirty ? `${diff.length} kayıt taşındı` : "Değişiklik yok"}
                </span>
                <div className="ms-auto flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="h-11 rounded-xl border border-ad-line-strong px-5 text-sm font-semibold text-ad-body transition-colors hover:bg-ad-sunken disabled:opacity-50"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="button"
                        onClick={save}
                        disabled={busy || !dirty}
                        className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-6 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110 disabled:opacity-50"
                    >
                        {busy && <Icon name="progress_activity" className="animate-spin text-[17px]" />}
                        Sırayı Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
}

function MoveButton({ icon, label, disabled, onClick, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-ad-body transition-colors hover:bg-ad-sunken hover:text-ad-brand disabled:opacity-25 disabled:hover:bg-transparent ${className}`}
        >
            <Icon name={icon} className="text-[20px]" />
        </button>
    );
}