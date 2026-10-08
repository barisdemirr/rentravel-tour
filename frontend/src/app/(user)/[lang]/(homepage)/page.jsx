import HeroSection from "@/components/sections/HeroSection";
import BookingSection from "@/components/sections/BookingSection";
import FeaturedVehicles from "@/components/sections/FeaturedVehicles";
import DailyTours from "@/components/sections/DailyTours";
import CultureTours from "@/components/sections/CultureTours";
import FeaturedBungalows from "@/components/sections/FeaturedBungalows";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactBanner from "@/components/sections/ContactBanner";
import { safe } from "@/lib/api";
import { featuredOf } from "@/lib/featured";
import {
    getBungalows,
    getCultureTours,
    getDailyTours,
    getHeroSlides,
    getTestimonials,
    getVehicles,
} from "@/services";

export default async function HomePage() {
    // Bir istek hata verirse yalnızca o bölüm boş kalır, sayfa açılır
    const [heroSlides, vehicles, dailyTours, cultureTours, bungalows, testimonials] = await Promise.all([
        safe(getHeroSlides(), []),
        safe(getVehicles()),
        safe(getDailyTours()),
        safe(getCultureTours()),
        safe(getBungalows()),
        safe(getTestimonials()),
    ]);

    return (
        <>
            <HeroSection slides={heroSlides} />
            <BookingSection dailyTours={dailyTours} cultureTours={cultureTours} />
            <FeaturedVehicles vehicles={featuredOf(vehicles)} />
            <DailyTours tours={featuredOf(dailyTours)} />
            <CultureTours tours={featuredOf(cultureTours)} />
            <FeaturedBungalows bungalows={featuredOf(bungalows)} />
            <TestimonialsSection testimonials={testimonials} />
            <ContactBanner />
        </>
    );
}