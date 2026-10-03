"use client";

import HeroSection from "@/components/sections/HeroSection";
import BookingSection from "@/components/sections/BookingSection";
import FeaturedVehicles from "@/components/sections/FeaturedVehicles";
import DailyTours from "@/components/sections/DailyTours";
import CultureTours from "@/components/sections/CultureTours";
import FeaturedBungalows from "@/components/sections/FeaturedBungalows";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactBanner from "@/components/sections/ContactBanner";

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <BookingSection />
            <FeaturedVehicles />
            <DailyTours />
            <CultureTours />
            <FeaturedBungalows />
            <TestimonialsSection />
            <ContactBanner />
        </>
    );
}