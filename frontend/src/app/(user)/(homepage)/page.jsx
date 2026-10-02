"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import MobileDrawer from "@/components/layout/MobileDrawer";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import SplashScreen from "@/components/ui/SplashScreen";
import HeroSection from "@/components/sections/HeroSection";
import BookingSection from "@/components/sections/BookingSection";
import FeaturedVehicles from "@/components/sections/FeaturedVehicles";
import DailyTours from "@/components/sections/DailyTours";
import CultureTours from "@/components/sections/CultureTours";
import FeaturedBungalows from "@/components/sections/FeaturedBungalows";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactBanner from "@/components/sections/ContactBanner";

export default function HomePage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const openMenu = useCallback(() => setMenuOpen(true), []);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    return (
        <>
            <SplashScreen />
            <Navbar onOpenMenu={openMenu} />
            <MobileDrawer open={menuOpen} onClose={closeMenu} />
            <main id="main" className="w-full bg-surface pt-20">
                <HeroSection />
                <BookingSection />
                <FeaturedVehicles />
                <DailyTours />
                <CultureTours />
                <FeaturedBungalows />
                <TestimonialsSection />
                <ContactBanner />
            </main>
            <Footer />
            <WhatsAppFloat />
        </>
    );
}