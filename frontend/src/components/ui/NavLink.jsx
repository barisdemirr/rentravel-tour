"use client";

import Link from "next/link";
import { HOVER_RED } from "@/lib/constants";

export default function NavLink({ href, active, children, onClick, className = "" }) {
    const baseColor = active ? "text-primary-container" : "text-on-surface-variant";

    return (
        <Link
            href={href}
            onClick={onClick}
            aria-current={active ? "page" : undefined}
            className={`group/nav relative inline-flex items-center rounded-lg px-2 py-2 font-label-uppercase text-label-uppercase uppercase transition-colors duration-300 ${baseColor} ${className}`}
            onMouseEnter={(e) => { e.currentTarget.style.color = HOVER_RED; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = ""; }}
        >
            <span className="relative z-10">{children}</span>

            {/* Alt çizgi: soldan sağa animasyonlu */}
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-crimson-vivid transition-transform duration-300 ease-out ${active ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"
                    }`}
                style={{ backgroundColor: "currentColor" }}
            />
        </Link>
    );
}