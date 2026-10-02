"use client";

import { useState } from "react";

export default function SafeImage({
    src,
    alt = "",
    className = "",
    fallbackClassName = "",
    ...rest
}) {
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div
                aria-hidden="true"
                className={`${className} ${fallbackClassName} flex items-center justify-center bg-charcoal-surface`}
            >
                <span className="material-symbols-outlined text-[40px] text-surface-white/30">
                    image
                </span>
            </div>
        );
    }

    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setFailed(true)}
            {...rest}
        />
    );
}