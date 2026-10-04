"use client";

import { useRef } from "react";

/** <input type="time"> yerine: ekranda her zaman 24 saatlik (10:00) gösterir. */
export default function TimeField({ value, onChange, className = "", ...rest }) {
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
            className={`relative flex min-w-0 items-center focus-within:ring-2 focus-within:ring-crimson-vivid/30 ${className}`}
        >
            <span dir="ltr" className={`truncate ${value ? "" : "text-secondary/50"}`}>
                {value || "--:--"}
            </span>
            <input
                {...rest}
                ref={ref}
                type="time"
                value={value}
                onChange={onChange}
                onClick={openPicker}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
        </div>
    );
}