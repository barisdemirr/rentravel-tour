"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Icon from "./Icon";

const AGES = Array.from({ length: 18 }, (_, i) => i); // 0-17

/** ages: "" = henüz seçilmedi. Yaş seçilene kadar uyarı gösterir. */
export default function ChildAgesField({ ages, setAges, sub, max = 10, canAdd = true }) {
    const { t, tpl } = useLanguage();
    const d = t.tourDetail;
    const agesReady = ages.every((a) => a !== "");
    const addDisabled = ages.length >= max || !canAdd;

    return (
        <div className="flex flex-col gap-2 rounded-2xl bg-canvas-offwhite p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <span className="block font-label-md text-label-md font-bold text-charcoal-dark">
                        {d.children}
                    </span>
                    <span className="block font-body-sm text-body-sm text-secondary">{sub ?? d.childrenSub}</span>
                </div>

                {/* Buton hiçbir zaman gizlenmez; limit/kapasite dolunca pasif görünür */}
                <button
                    type="button"
                    disabled={addDisabled}
                    onClick={() => setAges((a) => [...a, ""])}
                    className="flex shrink-0 items-center gap-1 rounded-full bg-surface-white px-3.5 py-2 font-label-md text-label-md font-semibold text-charcoal-dark shadow-sm transition-colors hover:bg-crimson-vivid hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface-white disabled:hover:text-charcoal-dark disabled:active:scale-100"
                >
                    <Icon name="add" className="text-[16px]" />
                    {d.addChild}
                </button>
            </div>

            {ages.map((age, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className="relative min-w-0 flex-1">
                        <select
                            aria-label={tpl(d.childAge, { n: i + 1 })}
                            value={age}
                            onChange={(e) =>
                                setAges((list) => list.map((x, idx) => (idx === i ? e.target.value : x)))
                            }
                            className="w-full cursor-pointer appearance-none rounded-xl bg-surface-white py-2.5 ps-3 pe-9 font-label-md text-label-md font-semibold text-charcoal-dark focus:outline-none focus:ring-2 focus:ring-crimson-vivid/30"
                        >
                            <option value="" disabled>
                                {tpl(d.childAge, { n: i + 1 })} · {d.agePlaceholder}
                            </option>
                            {AGES.map((a) => (
                                <option key={a} value={a}>
                                    {tpl(d.ageValue, { age: a })}
                                </option>
                            ))}
                        </select>
                        <Icon
                            name="expand_more"
                            className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-[20px] text-secondary"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setAges((list) => list.filter((_, idx) => idx !== i))}
                        aria-label={d.removeChild}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-white text-secondary shadow-sm transition-colors hover:bg-crimson-vivid/10 hover:text-crimson-vivid"
                    >
                        <Icon name="close" className="text-[18px]" />
                    </button>
                </div>
            ))}

            {!agesReady && <p className="font-body-sm text-body-sm text-crimson-vivid">{d.ageHint}</p>}
        </div>
    );
}