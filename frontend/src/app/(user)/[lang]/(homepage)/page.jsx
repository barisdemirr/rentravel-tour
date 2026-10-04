import HeroSection from "@/components/sections/HeroSection";
import BookingSection from "@/components/sections/BookingSection";
import FeaturedVehicles from "@/components/sections/FeaturedVehicles";
import DailyTours from "@/components/sections/DailyTours";
import CultureTours from "@/components/sections/CultureTours";
import FeaturedBungalows from "@/components/sections/FeaturedBungalows";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactBanner from "@/components/sections/ContactBanner";
import { safe } from "@/lib/api";
import { getCultureTours, getDailyTours, getTestimonials } from "@/services";

export default async function HomePage() {
    // Bir istek hata verirse yalnızca o bölüm boş kalır, sayfa açılır
    const [dailyTours, cultureTours, testimonials] = await Promise.all([
        safe(getDailyTours()),
        safe(getCultureTours()),
        safe(getTestimonials()),
    ]);

    return (
        <>
            <HeroSection />
            <BookingSection dailyTours={dailyTours} cultureTours={cultureTours} />
            <FeaturedVehicles />
            <DailyTours />
            <CultureTours />
            <FeaturedBungalows />
            <TestimonialsSection testimonials={testimonials} />
            <ContactBanner />
        </>
    );
}