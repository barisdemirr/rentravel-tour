"use client";

import TourListClient from "@/components/sections/TourListClient";

/* Hero arka plan görseli: Kapadokya balonlar */
const HERO_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAT85QKYdzRPT0oCgAY_1KKTMfnFqYxzsmZLHeEiKOUOXh92xBc4R67ZK2aGsY4yIsKY9EibVhESTf2idPOEhaibqBaYQlJFYyiKZaJkV18HstaO6OqbYFFBcLGeniKuvWs1wIRH93pCCOtld-qZS8pv_trJ7t4pxnXejl6qkLoQWcBwrNKJJOjoZlOJAGtqKN0ryPLhJ2ioC4mg8UDRD5B2woAYfFlHzuWYX0CxGbwonZfZy4cA3frvw";

export default function CultureToursClient(props) {
    return (
        <TourListClient
            {...props}
            variant="culture"
            dictKey="cultureList"
            heroBg={HERO_BG}
            heroIcon="castle"
            trustIcons={["verified", "hotel", "restaurant"]}
        />
    );
}