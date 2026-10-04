"use client";

import Link, { useLinkStatus } from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useNavigationPending } from "@/lib/navigation/NavigationProvider";

// useLinkStatus yalnızca <Link>'in çocuğu olan bir bileşende çalışır
function PendingReporter() {
    const { pending } = useLinkStatus();
    useNavigationPending(pending);
    return null;
}

// next/link ile aynı, ama iç bağlantılara dil önekini ekler ve tıklamadan sayfa gelene kadar splash gösterir
export default function LocalizedLink({ href, children, ...props }) {
    const { href: localize } = useLanguage();

    return (
        <Link href={typeof href === "string" ? localize(href) : href} {...props}>
            {children}
            <PendingReporter />
        </Link>
    );
}