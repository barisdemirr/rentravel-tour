"use client";

import TourListClient from "@/components/sections/TourListClient";

const HERO_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCkwDqEPAeNrXqPgnoM6WRcK8XCRH0Vq5mqeVcJJAKWlTbXr7zzeeFtGjpbIo8aavqAeyDGi_Lrf5-4eM-6Lc9fv4lomoh_Gb_ThEDM7Hk3Tcg83OfBi4A7D_d3pYTl8pW1UJxD4iY4oijFSbodCQYdKpY-sYBZ70gD1qCFW_dHKf6VeeNONLjdxOWkB90nI0XJg_VBS3upPnWWxFfvmD9SfexSHwEC2pxg8V6VFaMdMeBhTnAtu_u2zQ";

export default function DailyToursClient(props) {
    return (
        <TourListClient
            {...props}
            variant="daily"
            dictKey="dailyList"
            heroBg={HERO_BG}
            heroIcon="eco"
            trustIcons={["verified", "directions_bus", "event_available"]}
        />
    );
}