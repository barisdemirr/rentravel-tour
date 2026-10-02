"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import BookingSection from "@/components/sections/BookingSection";

export default function HomePage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <>
            <Navbar onOpenMenu={openMenu} />
            <MobileDrawer open={menuOpen} onClose={closeMenu} />
            <main id="main" className="w-full bg-surface pt-20">
                <HeroSection />
                <BookingSection />
            </main>
            <Footer />
        </>
    );
}