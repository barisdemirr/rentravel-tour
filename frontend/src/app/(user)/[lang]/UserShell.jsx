"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import SplashScreen from "@/components/ui/SplashScreen";
import NavigationSplash from "@/components/ui/NavigationSplash";

export default function UserShell({ pages = [], children }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <>
            <SplashScreen />
            <NavigationSplash />
            <Navbar onOpenMenu={openMenu} />
            <MobileDrawer open={menuOpen} onClose={closeMenu} pages={pages} />
            {/* Başlık yüksekliği: telefonda 64px, masaüstünde 80px */}
            <main id="main" className="w-full bg-surface pt-16 md:pt-20">
                {children}
            </main>
            <Footer pages={pages} />
            <WhatsAppFloat />
        </>
    );
}