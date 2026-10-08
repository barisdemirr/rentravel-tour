import { headers } from "next/headers";
import { getDictionary } from "@/lib/i18n/getDictionary";
import NotFoundView from "@/components/sections/NotFoundView";

export default async function LocaleNotFound() {
    const lang = (await headers()).get("x-locale") || "tr";
    const dict = getDictionary(lang);

    return <NotFoundView dict={dict} locale={lang} />;
}