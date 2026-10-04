"use client";

import Icon from "@/components/ui/Icon";
import LocalizedField, { emptyLocalized, toLocalized } from "@/components/admin/LocalizedField";
import { move } from "@/lib/admin/reorder";
import { TextInput } from "./fields";

/**
 * Çok dilli metinlerden oluşan liste.
 * withIcon: her maddeye ikon alanı ekler (ListItem şeması için)
 * value: withIcon ? [{ icon, text }] : [LocalizedText]
 */
export default function LocalizedListField({
    label,
    hint,
    value = [],
    onChange,
    withIcon = false,
    multiline = false,
    maxLength = 200,
    max = 15,
    addLabel = "Madde ekle",
    namePrefix = "item",
}) {
    const textOf = (item) => (withIcon ? toLocalized(item.text) : toLocalized(item));
    const setText = (index, next) =>
        onChange(value.map((item, i) => (i === index ? (withIcon ? { ...item, text: next } : next) : item)));

    const add = () => onChange([...value, withIcon ? { icon: "", text: emptyLocalized() } : emptyLocalized()]);
    const remove = (index) => onChange(value.filter((_, i) => i !== index));
    const shift = (index, delta) => onChange(move(value, index, delta));

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <span className="text-xs font-semibold text-ad-body">{label}</span>
                    {hint && <p className="mt-0.5 text-xs text-ad-faint">{hint}</p>}
                </div>
                <span className="shrink-0 text-xs text-ad-faint">
                    {value.length} / {max}
                </span>
            </div>

            {value.map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-xl border border-ad-line bg-ad-surface p-2.5">
                    <span className="mt-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ad-sunken text-xs font-bold text-ad-muted">
                        {i + 1}
                    </span>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        {withIcon && (
                            <div className="flex items-center gap-2">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ad-sunken text-ad-brand">
                                    <Icon name={item.icon || "check"} className="text-[18px]" />
                                </span>
                                <TextInput
                                    dir="ltr"
                                    placeholder="İkon adı (boş bırakılabilir)"
                                    value={item.icon ?? ""}
                                    onChange={(e) =>
                                        onChange(value.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))
                                    }
                                />
                            </div>
                        )}

                        <LocalizedField
                            name={`${namePrefix}-${i}`}
                            label=""
                            multiline={multiline}
                            rows={3}
                            maxLength={maxLength}
                            value={textOf(item)}
                            onChange={(next) => setText(i, next)}
                        />
                    </div>

                    <div className="mt-1 flex shrink-0 flex-col gap-0.5">
                        <button
                            type="button"
                            onClick={() => shift(i, -1)}
                            disabled={i === 0}
                            aria-label="Yukarı taşı"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-sunken disabled:opacity-25"
                        >
                            <Icon name="keyboard_arrow_up" className="text-[18px]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => shift(i, 1)}
                            disabled={i === value.length - 1}
                            aria-label="Aşağı taşı"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-sunken disabled:opacity-25"
                        >
                            <Icon name="keyboard_arrow_down" className="text-[18px]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            aria-label="Maddeyi sil"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-brand-soft hover:text-ad-brand"
                        >
                            <Icon name="delete" className="text-[17px]" />
                        </button>
                    </div>
                </div>
            ))}

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