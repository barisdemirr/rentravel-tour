"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { COUNTRIES, formatPhone, normalizePhone } from "@/lib/phone";

/**
 * Ülke kodu + numara. Girişi temizler ve gruplar.
 * value: { country: "TR", digits: "5321234567" }
 */
export default function PhoneField({ value, onChange, error, inputRef, onKeyDown, placeholder }) {
    const { t } = useLanguage();
    const v = t.vip;

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapRef = useRef(null);
    const searchRef = useRef(null);

    const country = COUNTRIES.find((c) => c.code === value.country) ?? COUNTRIES[0];

    useEffect(() => {
        if (!open) return;
        const onDown = (e) => !wrapRef.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("pointerdown", onDown);
        document.addEventListener("keydown", onKey);
        setTimeout(() => searchRef.current?.focus(), 50);
        return () => {
            document.removeEventListener("pointerdown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const handleInput = (e) => {
        const { digits, switchTo } = normalizePhone(e.target.value, country);
        // Yapıştırılan numarada başka ülke kodu varsa ülkeyi de değiştir
        onChange({ country: switchTo?.code ?? country.code, digits });
    };

    const pickCountry = (next) => {
        onChange({ country: next.code, digits: value.digits });
        setOpen(false);
        setQuery("");
        setTimeout(() => inputRef?.current?.focus(), 50);
    };

    const filtered = query.trim()
        ? COUNTRIES.filter((c) =>
            `${c.name} ${c.dial} ${c.code}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))
        )
        : COUNTRIES;

    const borderCls = error ? "border-crimson-vivid" : "border-white/20 focus-within:border-crimson-vivid";

    return (
        <div ref={wrapRef} className="relative">
            <div className={`flex items-end gap-3 border-b-2 pb-3 pt-2 transition-colors ${borderCls}`}>
                {/* Ülke seçici */}
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-label={v.countryLabel}
                    onClick={() => setOpen((o) => !o)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-1 py-1 transition-colors hover:bg-white/5"
                >
                    <span className="text-[26px] leading-none md:text-[30px]">{country.flag}</span>
                    <span
                        dir="ltr"
                        className="font-headline-md text-headline-md font-semibold text-white md:font-headline-lg md:text-headline-lg"
                    >
                        +{country.dial}
                    </span>
                    <Icon
                        name="expand_more"
                        className={`text-[18px] text-white/40 transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </button>

                {/* Numara */}
                <input
                    ref={inputRef}
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    autoComplete="tel-national"
                    aria-label={v.phoneLabel}
                    value={formatPhone(value.digits, country)}
                    onChange={handleInput}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 font-headline-md text-headline-md font-semibold text-white outline-none placeholder:font-normal placeholder:text-white/25 md:font-headline-lg md:text-headline-lg"
                />
            </div>

            {/* Ülke listesi */}
            {open && (
                <div
                    role="listbox"
                    className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-charcoal-surface shadow-[0_20px_48px_-12px_rgba(0,0,0,0.7)]"
                >
                    <div className="border-b border-white/10 p-2">
                        <input
                            ref={searchRef}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={v.countryLabel}
                            className="w-full rounded-lg bg-white/5 px-3 py-2.5 font-body-sm text-body-sm text-white outline-none placeholder:text-white/30 focus:bg-white/10"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1">
                        {filtered.map((c) => (
                            <button
                                key={c.code}
                                type="button"
                                role="option"
                                aria-selected={c.code === country.code}
                                onClick={() => pickCountry(c)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors ${c.code === country.code
                                    ? "bg-crimson-vivid/15 text-white"
                                    : "text-white/70 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <span className="shrink-0 text-[22px] leading-none">{c.flag}</span>
                                <span className="min-w-0 flex-1 truncate font-body-sm text-body-sm">{c.name}</span>
                                <span dir="ltr" className="shrink-0 font-label-md text-label-md text-white/40">
                                    +{c.dial}
                                </span>
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <p className="px-3 py-4 text-center font-body-sm text-body-sm text-white/40">—</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}