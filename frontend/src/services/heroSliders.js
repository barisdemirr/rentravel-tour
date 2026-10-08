export async function getHeroSlides() {
    const res = await fetch(`${API_URL}/api/hero-slides`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
}