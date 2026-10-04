"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

// next/link ile aynı, ama iç bağlantılara dil önekini kendisi ekler
export default function LocalizedLink({ href, ...props }) {
    const { href: localize } = useLanguage();
    return <Link href={typeof href === "string" ? localize(href) : href} {...props} />;
}