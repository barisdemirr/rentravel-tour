"use client";

import { useRef } from "react";
import { formatDateInput } from "@/lib/format";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import Icon from "./Icon";

/**
 * <input type="date"> yerine kullanılır, aynı prop'ları alır (value "YYYY-MM-DD", onChange event verir).
 * Ekranda her zaman gg/aa/yyyy gösterir, dokununca cihazın kendi takvimi açılır.
 * className görünen kutuya uygulanır.
 */
export default function DateField({ value, onChange, className = "", ...rest }) {
    const { t } = useLanguage();
    const ref = useRef(null);

    const openPicker = () => {
        try {
            ref.current?.showPicker?.();
        } catch {
            /* desteklenmeyen tarayıcıda yerel davranış yeterli */
        }
    };

    return (
        <div
            className={`relative flex min-w-0 items-center justify-between gap-2 focus-within:ring-2 focus-within:ring-crimson-vivid/30 ${className}`}
        >
            <span dir="ltr" className={`truncate ${value ? "" : "text-secondary/50"}`}>
                {value ? formatDateInput(value) : t.common.datePlaceholder}
            </span>
            <Icon name="calendar_month" className="shrink-0 text-[18px] text-secondary" />
            <input
                {...rest}
                ref={ref}
                type="date"
                value={value}
                onChange={onChange}
                onClick={openPicker}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
        </div>
    );
}