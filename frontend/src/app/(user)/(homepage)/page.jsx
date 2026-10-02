"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <>
            <Navbar onOpenMenu={openMenu} />
            <MobileDrawer open={menuOpen} onClose={closeMenu} />
            <main className="min-h-screen bg-surface pt-20">
                <div className="mx-auto max-w-3xl px-6 py-20 text-center">
                    <h1 className="font-headline-lg text-headline-lg uppercase text-charcoal-dark">
                        Aşama 3 tamam
                    </h1>
                    <p className="mt-4 font-body-lg text-body-lg text-secondary">
                        Navbar, mobil menü ve footer hazır. Sonraki aşamada hero ve rezervasyon gelecek.
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}