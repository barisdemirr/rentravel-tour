"use client";

import Icon from "@/components/ui/Icon";
import Eyebrow from "@/components/ui/Eyebrow";
import LanguageMenu from "@/components/ui/LanguageMenu";
import Reveal from "@/components/ui/Reveal";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-surface p-10">
            <div className="mx-auto max-w-2xl space-y-6">
                <Eyebrow>Test Eyebrow</Eyebrow>
                <Icon name="star" fill className="text-[32px] text-crimson-vivid" />
                <LanguageMenu />
                <Reveal>
                    <p className="rounded-2xl bg-surface-white p-6 shadow-sm">
                        Reveal testi — sayfayı kaydır, animasyonla gelmeli.
                    </p>
                </Reveal>
            </div>
        </main>
    );
}