/** Tur DTO'sundan PUT gövdesi üretir (yerinde küçük güncellemeler için) */
export function tourToInput(t, variant) {
    const body = {
        slug: t.slug,
        categoryId: t.category?.id ?? null,
        title: t.title,
        description: t.description,
        longDescription: t.longDescription,
        image: t.image,
        gallery: t.gallery ?? [],
        badge: t.badge,
        badgeTone: t.badgeTone,
        duration: t.duration,
        transport: t.transport,
        transportIcon: t.transportIcon,
        badges: t.badges ?? [],
        routePills: t.routePills ?? [],
        quickSpecs: t.quickSpecs ?? [],
        editorial: t.editorial,
        itinerary: t.itinerary ?? [],
        inclusions: t.inclusions,
        travelNotes: t.travelNotes ?? [],
        seatsTotal: t.seatsTotal ?? 0,
        seoTitle: t.seoTitle,
        seoDescription: t.seoDescription,
        seoKeywords: t.seoKeywords,
        ogImage: t.ogImage,
        defaultBasePrice: t.defaultBasePrice,
        currency: t.currency,
        isFeatured: t.isFeatured,
        isActive: t.isActive,
        orderIndex: t.orderIndex,
    };

    if (variant === "culture") body.nights = t.nights ?? 0;
    return body;
}