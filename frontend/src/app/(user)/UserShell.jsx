"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import SplashScreen from "@/components/ui/SplashScreen";

export default function UserShell({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <>
            <SplashScreen />
            <Navbar onOpenMenu={openMenu} />
            <MobileDrawer open={menuOpen} onClose={closeMenu} />
            <main id="main" className="w-full bg-surface pt-20">
                {children}
            </main>
            <Footer />
            <WhatsAppFloat />
        </>
    );
}