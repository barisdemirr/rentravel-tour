"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "@/components/ui/Icon";
import { vehicles, VEHICLE_SEGMENTS, CORPORATE_VEHICLE_TYPES } from "@/lib/mockData";

/* Hero arka plan görseli */
const HERO_BG =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAvRzs4pa1PMvu4VPDkfTXMn2SoMJD5lKt5fMgEzl8rMR0stFMqHauYXq6_hqzDfznn66WVYhIdpPWaXvdfGCMnm-bAU65jfkwIV7FgR_NP6ne6NbGX6RgDy-5RnXrBkC2r5QUg5xJReeMKTgWggTXgIaJ0Kf18iAImrvC_-x-In7hnk8wwYX2WXWip5fH1kJ3zYEXa4MUarWXiV4hFhvK9pUlRIcUbsQ-yIo-px39t_xVVeDX3bT6KzA";

const SORT_OPTIONS = [
    { value: "recommended", label: "Önerilen" },
    { value: "price-asc", label: "Fiyata Göre (Artan)" },
    { value: "price-desc", label: "Fiyata Göre (Azalan)" },
    { value: "rating", label: "Müşteri Puanına Göre" },
];

/* ───────── Yardımcılar ───────── */
const todayISO = () =>
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

const plusDays = (iso, days) => {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
};

const priceOf = (v) => parseInt(String(v.price3Days).replace(/\D/g, ""), 10) || 0;

const dayDiff = (from, to) => {
    if (!from || !to) return 0;
    const a = new Date(`${from}T00:00:00`).getTime();
    const b = new Date(`${to}T00:00:00`).getTime();
    return Math.max(1, Math.round((b - a) / 86400000));
};

export default function CarRentalPage() {
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("10:00");
    const [returnDate, setReturnDate] = useState("");
    const [returnTime, setReturnTime] = useState("10:00");
    const [segment, setSegment] = useState("all");
    const [sortBy, setSortBy] = useState("recommended");
    const catalogRef = useRef(null);
    const corporateRef = useRef(null);

    /* Tarihleri client'ta kur (hydration güvenliği) */
    useEffect(() => {
        const t = todayISO();
        setPickupDate(t);
        setReturnDate(plusDays(t, 3));
    }, []);

    const rentalDays = useMemo(
        () => dayDiff(pickupDate, returnDate),
        [pickupDate, returnDate]
    );

    /* Segment listesi + sayılar */
    const segments = useMemo(() => {
        const counts = {};
        vehicles.forEach((v) => {
            counts[v.segment] = (counts[v.segment] || 0) + 1;
        });
        return VEHICLE_SEGMENTS.map((s) => ({
            ...s,
            count: s.value === "all" ? vehicles.length : counts[s.value] || 0,
        }));
    }, []);

    /* Filtre + sıralama */
    const visibleVehicles = useMemo(() => {
        let arr = vehicles;
        if (segment !== "all") arr = arr.filter((v) => v.segment === segment);
        arr = [...arr];
        if (sortBy === "price-asc") arr.sort((a, b) => priceOf(a) - priceOf(b));
        else if (sortBy === "price-desc") arr.sort((a, b) => priceOf(b) - priceOf(a));
        else if (sortBy === "rating")
            arr.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        return arr;
    }, [segment, sortBy]);

    const scrollToCatalog = () =>
        catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const scrollToCorporate = () =>
        corporateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    const onSearch = (e) => {
        e.preventDefault();
        scrollToCatalog();
    };

    return (
        <>
            {/* ─────────── HERO ─────────── */}
            <section className="relative flex h-[340px] w-full items-center justify-center overflow-hidden bg-charcoal-dark md:h-[400px]">
                <div
                    className="absolute inset-0 scale-105 bg-cover bg-center opacity-45 transition-transform duration-1000 ease-out"
                    style={{ backgroundImage: `url('${HERO_BG}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-charcoal-dark/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark/80 via-transparent to-charcoal-dark/80" />

                <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-10">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-white shadow-sm backdrop-blur-md sm:px-4">
                        <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-crimson-vivid" />
                        <span className="font-label-uppercase text-label-uppercase font-semibold tracking-wider text-[10px] sm:text-[11px]">
                            Trabzon Havalimanı (TZX) & Doğu Karadeniz
                        </span>
                    </div>

                    <h1 className="max-w-3xl font-headline-lg-mobile text-headline-lg-mobile font-extrabold uppercase leading-tight tracking-tight text-white drop-shadow-sm md:font-headline-lg md:text-headline-lg">
                        Trabzon Havalimanı & Bölge Araç Kiralama Filosu
                    </h1>

                    <p className="mt-3 max-w-2xl font-body-md text-body-md text-white/90 md:text-body-lg md:font-body-lg">
                        Rentravel güvencesiyle 7/24 Havalimanı teslimatlı, tam kaskolu, son model binek ve VIP araçlar.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <HeroBadge icon="flight_takeoff" text="7/24 Havalimanı Karşılama" />
                        <HeroBadge icon="verified_user" text="Tam Kapsamlı Kasko" />
                        <HeroBadge icon="key" text="Hızlı Anahtar Teslimi" />
                    </div>
                </div>
            </section>

            {/* ─────────── REZERVASYON BARI (sadece 4 tarih/saat) ─────────── */}
            <section className="relative z-20 mx-auto -mt-12 w-full max-w-5xl px-4 sm:px-6 lg:px-10">
                <div className="rounded-3xl bg-surface-white p-4 shadow-[0_20px_40px_-15px_rgba(15,17,21,0.09)] sm:p-5 md:p-6">
                    <form onSubmit={onSearch}>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                            {/* Alış tarihi */}
                            <FieldWrapper className="lg:col-span-3">
                                <FieldLabel icon="calendar_today" text="Alış Tarihi" />
                                <input
                                    type="date"
                                    value={pickupDate}
                                    min={todayISO()}
                                    onChange={(e) => {
                                        setPickupDate(e.target.value);
                                        if (e.target.value > returnDate)
                                            setReturnDate(plusDays(e.target.value, 3));
                                    }}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            {/* Alış saati */}
                            <FieldWrapper className="lg:col-span-2">
                                <FieldLabel icon="schedule" text="Alış Saati" />
                                <input
                                    type="time"
                                    value={pickupTime}
                                    onChange={(e) => setPickupTime(e.target.value)}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            {/* Teslim tarihi */}
                            <FieldWrapper className="lg:col-span-3">
                                <FieldLabel icon="event_repeat" text="Teslim Tarihi" />
                                <input
                                    type="date"
                                    value={returnDate}
                                    min={pickupDate || todayISO()}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            {/* Teslim saati */}
                            <FieldWrapper className="lg:col-span-2">
                                <FieldLabel icon="schedule" text="Teslim Saati" />
                                <input
                                    type="time"
                                    value={returnTime}
                                    onChange={(e) => setReturnTime(e.target.value)}
                                    className="w-full bg-transparent font-headline-sm text-headline-sm font-semibold text-charcoal-dark focus:outline-none"
                                />
                            </FieldWrapper>

                            {/* CTA */}
                            <div className="w-full sm:col-span-2 lg:col-span-2">
                                <button
                                    type="submit"
                                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary-container font-headline-sm text-headline-sm font-bold text-on-primary shadow-[0_10px_25px_-5px_rgba(187,0,38,0.35)] transition-all hover:bg-crimson-vivid active:scale-95"
                                >
                                    <Icon name="directions_car" className="text-[22px] transition-transform group-hover:scale-110" />
                                    <span>Listele</span>
                                </button>
                            </div>
                        </div>

                        {/* Alt bilgi satırı */}
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-surface-variant pt-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <InfoPill icon="badge" text="21+ Yaş & 2 Yıl Ehliyet" />
                                <InfoPill icon="credit_card" text="Kredi Kartı Provizyon" />
                            </div>
                            <div className="flex items-center gap-1.5 font-label-md text-label-md text-secondary">
                                <Icon name="bolt" className="text-[16px] text-crimson-vivid" />
                                <span>
                                    Toplam{" "}
                                    <strong className="text-charcoal-dark">{rentalDays} gün</strong>
                                </span>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Kurumsal banner — küçük CTA */}
                <button
                    type="button"
                    onClick={scrollToCorporate}
                    className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-primary-container/20 bg-primary-container/5 px-4 py-3 text-left transition-colors hover:bg-primary-container/10 sm:px-5"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-container text-on-primary">
                            <Icon name="corporate_fare" className="text-[20px]" />
                        </span>
                        <div className="min-w-0">
                            <div className="truncate font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                                Kurumsal Aylık Kiralama
                            </div>
                            <div className="truncate font-body-sm text-body-sm text-secondary">
                                Uzun dönem filo talepleri için hızlı başvuru
                            </div>
                        </div>
                    </div>
                    <Icon name="arrow_downward" className="shrink-0 text-[20px] text-crimson-vivid" />
                </button>
            </section>

            {/* ─────────── SEGMENT FİLTRELERİ ─────────── */}
            <section
                ref={catalogRef}
                className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pt-10 sm:px-6 lg:px-10"
            >
                <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
                    {segments.map((s) => (
                        <SegmentPill
                            key={s.value}
                            active={segment === s.value}
                            onClick={() => setSegment(s.value)}
                            icon={s.icon}
                        >
                            {s.label} ({s.count})
                        </SegmentPill>
                    ))}
                </div>

                {/* Sıralama + sayaç */}
                <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-canvas-offwhite/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500 opacity-75" />
                        <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                            {visibleVehicles.length} Müsait Araç Bulundu
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-label-uppercase text-label-uppercase font-semibold text-emerald-700">
                            Anında Onaylı
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="hidden font-label-md text-label-md text-secondary md:inline">
                            Sıralama:
                        </span>
                        <div className="relative flex-1 sm:w-56">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full cursor-pointer appearance-none rounded-xl border border-surface-variant bg-surface-white px-4 py-2 pr-9 font-label-md text-label-md text-charcoal-dark shadow-sm focus:outline-none focus:ring-2 focus:ring-crimson-vivid/20"
                            >
                                {SORT_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            <Icon
                                name="unfold_more"
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── ARAÇ KARTLARI ─────────── */}
            <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-8 sm:px-6 lg:px-10">
                {visibleVehicles.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-variant bg-surface-white px-6 py-16 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-canvas-offwhite">
                            <Icon name="no_crash" className="text-[28px] text-crimson-vivid" />
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-charcoal-dark">
                            Bu segmentte araç bulunamadı
                        </h3>
                        <p className="max-w-md font-body-sm text-body-sm text-secondary">
                            Farklı bir segment seçmeyi deneyin.
                        </p>
                        <button
                            type="button"
                            onClick={() => setSegment("all")}
                            className="mt-2 rounded-xl bg-charcoal-dark px-6 py-3 font-label-uppercase text-label-uppercase tracking-wider text-surface-white transition-colors hover:bg-primary-container"
                        >
                            Tüm Araçları Göster
                        </button>
                    </div>
                ) : (
                    visibleVehicles.map((v) => <VehicleRow key={v.id} vehicle={v} days={rentalDays} />)
                )}
            </section>

            {/* ─────────── KURUMSAL AYLIK KİRALAMA FORMU ─────────── */}
            <section
                ref={corporateRef}
                className="mx-auto w-full max-w-5xl scroll-mt-24 px-4 pb-16 pt-8 sm:px-6 lg:px-10"
            >
                <CorporateForm />
            </section>

            {/* ─────────── AVANTAJLAR ─────────── */}
            <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-10">
                <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
                    <span className="mb-2 inline-block rounded-full bg-primary-fixed px-4 py-1 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary-fixed-variant">
                        Rentravel Ayrıcalıkları
                    </span>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                        Karadeniz'de Güvenli ve Konforlu Sürüş Garantisi
                    </h2>
                    <p className="mt-2 font-body-md text-body-md text-secondary">
                        Sürpriz faturalar yok. TÜRSAB A Grubu lisansı ve şeffaf sözleşme ile seyahatinizi güvenceye alıyoruz.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <AdvantageCard
                        icon="shield"
                        tone="primary"
                        title="Tam Kapsamlı Güvence"
                        text="Sıfır sürpriz maliyet, şeffaf sözleşme ve kaza muafiyetsiz kasko koruması ile güvendesiniz."
                    />
                    <AdvantageCard
                        icon="flight_land"
                        tone="dark"
                        title="Terminal Önü Teslimat"
                        text="Trabzon Havalimanı iç ve dış hatlar çıkış kapısında personelimiz adınıza hazırlanmış anahtarla karşılar."
                    />
                    <AdvantageCard
                        icon="support_agent"
                        tone="emerald"
                        title="7/24 Bölge Yol Yardımı"
                        text="Trabzon, Rize, Artvin ve Giresun yaylalarında kesintisiz mobil teknik servis ve ikame araç desteği."
                    />
                    <AdvantageCard
                        icon="sanitizer"
                        tone="neutral"
                        title="Ozon Sterilizasyon & Bakım"
                        text="Her yolculuk öncesi detaylı ozonla dezenfekte edilen ve periyodik muayenesi yapılmış araçlar."
                    />
                </div>
            </section>

            {/* ─────────── SSS ─────────── */}
            <section className="mx-auto w-full max-w-4xl px-4 pb-16 sm:px-6 lg:px-10">
                <div className="mb-8 text-center">
                    <span className="mb-1 block font-label-md text-label-md font-bold uppercase tracking-wider text-crimson-vivid">
                        Merak Edilenler
                    </span>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold text-charcoal-dark md:font-headline-lg md:text-headline-lg">
                        Sıkça Sorulan Sorular ve Şartlar
                    </h2>
                </div>

                <div className="space-y-3">
                    <FaqItem
                        question="Araç kiralama için ehliyet ve yaş sınırı nedir?"
                        answer="Ekonomik ve sedan araçlarımız için sürücünün en az 21 yaşında olması ve 2 yıllık geçerli bir B sınıfı sürücü belgesine sahip olması gerekmektedir. VIP Minivan (Mercedes Vito vb.) ve Lüks SUV kategorilerinde ise yaş sınırı 25 ve en az 3 yıllık ehliyet aranmaktadır."
                    />
                    <FaqItem
                        question="Depozito (Provizyon) nasıl tahsil edilir ve ne zaman iade edilir?"
                        answer="Depozito tutarı kiralama anında ana sürücünün adına kayıtlı kredi kartından ön provizyon olarak bloke edilir (nakit çekim yapılmaz). Araç eksiksiz ve hasarsız teslim edildikten sonra olası HGS/OGS geçişleri hesaplanarak bakiye kalan miktar 7-14 iş günü içinde bankanız tarafından otomatik olarak blokesi kaldırılır."
                    />
                    <FaqItem
                        question="Trabzon Havalimanı'nda (TZX) aracı nasıl teslim alırım?"
                        answer="Uçuş kodunuzu rezervasyon esnasında belirttiğiniz için uçağınız indiği anda operasyon yetkilimiz bagaj alım çıkış kapısında isminizin yazılı olduğu Rentravel levhasıyla sizi bekler. Terminal çıkış otoparkındaki aracınıza 2 dakika içinde geçerek dijital sözleşmenizi onaylayıp anahtarınızı teslim alabilirsiniz."
                    />
                    <FaqItem
                        question="Karadeniz yaylalarına (Pokut, Huser, Gito) kiralık araçla çıkabilir miyim?"
                        answer="Ayder ve Uzungöl gibi asfalt yola sahip merkezlere binek ve sedan araçlarımızla güvenle ulaşabilirsiniz. Ancak Pokut, Samistal ve Gito gibi taşlık ve yüksek rakımlı yayla etapları için filomuzda yer alan 4x4 Dacia Duster veya özel yerden yüksek SUV segmenti araçlarımızı tercih etmeniz gerekmektedir."
                    />
                    <FaqItem
                        question="Kurumsal aylık kiralama hizmetiniz var mı?"
                        answer="Evet. Rentravel olarak kurumsal firmalara uzun dönem (1 ay ve üzeri) araç kiralama hizmeti sunuyoruz. Filo yönetimi, ikame araç, kurumsal faturalama ve özel fiyatlandırma gibi avantajlardan yararlanabilirsiniz. Sayfadaki 'Kurumsal Aylık Kiralama' formundan başvuru yapabilirsiniz."
                    />
                </div>

                {/* Hızlı iletişim bannerı */}
                <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-charcoal-dark to-charcoal-surface p-6 text-white sm:flex-row">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container">
                            <Icon name="headset_mic" className="text-[24px] text-on-primary" />
                        </div>
                        <div>
                            <h4 className="font-headline-sm text-headline-sm font-bold text-white">
                                Özel Bir Araç veya Şoförlü VIP mi Lazım?
                            </h4>
                            <p className="font-body-sm text-body-sm text-white/80">
                                Filo uzmanlarımız Karadeniz rotanıza en uygun aracı 5 dakikada önersin.
                            </p>
                        </div>
                    </div>
                    <a
                        href="tel:08503096100"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary-container px-6 py-3 font-headline-sm text-headline-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-crimson-vivid"
                    >
                        <Icon name="call" className="text-[20px]" />
                        <span>0850 309 61 00</span>
                    </a>
                </div>
            </section>
        </>
    );
}

/* ─────────────────────────────────────────────
   KURUMSAL AYLIK KİRALAMA FORMU
   ───────────────────────────────────────────── */
function CorporateForm() {
    const [form, setForm] = useState({
        company: "",
        contactName: "",
        phone: "",
        email: "",
        startDate: "",
        endDate: "",
        months: "",
        vehicleType: CORPORATE_VEHICLE_TYPES[0].value,
        quantity: "1",
        notes: "",
    });

    const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const onSubmit = (e) => {
        e.preventDefault();

        const vehicleTypeLabel =
            CORPORATE_VEHICLE_TYPES.find((v) => v.value === form.vehicleType)?.label || "-";

        const lines = [
            "Merhaba, kurumsal aylık araç kiralama talebim var.",
            "",
            `• Firma: ${form.company || "-"}`,
            `• Yetkili: ${form.contactName || "-"}`,
            `• Telefon: ${form.phone || "-"}`,
            form.email ? `• E-posta: ${form.email}` : null,
            `• Kiralama Başlangıcı: ${form.startDate || "-"}`,
            `• Kiralama Bitişi: ${form.endDate || "-"}`,
            form.months ? `• Süre: ${form.months} ay` : null,
            `• Araç Tipi: ${vehicleTypeLabel}`,
            `• Adet: ${form.quantity}`,
            form.notes ? `• Not: ${form.notes}` : null,
        ].filter(Boolean);

        const text = lines.join("\n");
        const url = `https://wa.me/908503096100?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const fieldCls =
        "w-full rounded-xl border border-surface-variant bg-canvas-offwhite px-4 py-3 font-label-md text-label-md text-charcoal-dark outline-none transition-all placeholder:text-secondary/50 focus:border-crimson-vivid focus:bg-white focus:ring-2 focus:ring-crimson-vivid/15";
    const labelCls =
        "mb-1.5 flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary";

    return (
        <div className="overflow-hidden rounded-3xl bg-surface-white shadow-[0_20px_40px_-15px_rgba(15,17,21,0.09)]">
            {/* Başlık */}
            <div className="flex flex-col gap-3 bg-gradient-to-br from-charcoal-dark to-charcoal-surface p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary">
                        <Icon name="corporate_fare" className="text-[24px]" />
                    </span>
                    <div>
                        <span className="mb-1 block font-label-uppercase text-label-uppercase text-crimson-vivid">
                            Kurumsal Çözümler
                        </span>
                        <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-white">
                            Aylık / Uzun Dönem Araç Kiralama
                        </h2>
                        <p className="mt-1 max-w-xl font-body-sm text-body-sm text-white/75">
                            Firmanız için 1 ay ve üzeri filo kiralamalarında özel fiyatlandırma,
                            ikame araç ve kurumsal faturalama avantajları.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 sm:p-8">
                {/* Firma */}
                <div className="sm:col-span-2">
                    <label className={labelCls}>
                        <Icon name="business" className="text-[14px] text-crimson-vivid" />
                        Firma Adı
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="Örn: ABC Turizm Ltd. Şti."
                        value={form.company}
                        onChange={update("company")}
                        className={fieldCls}
                    />
                </div>

                {/* Yetkili */}
                <div>
                    <label className={labelCls}>
                        <Icon name="person" className="text-[14px] text-crimson-vivid" />
                        Yetkili Ad Soyad
                    </label>
                    <input
                        required
                        type="text"
                        placeholder="Adınız Soyadınız"
                        value={form.contactName}
                        onChange={update("contactName")}
                        className={fieldCls}
                    />
                </div>

                {/* Telefon */}
                <div>
                    <label className={labelCls}>
                        <Icon name="call" className="text-[14px] text-crimson-vivid" />
                        Telefon
                    </label>
                    <input
                        required
                        type="tel"
                        placeholder="05XX XXX XX XX"
                        value={form.phone}
                        onChange={update("phone")}
                        className={fieldCls}
                    />
                </div>

                {/* E-posta */}
                <div className="sm:col-span-2">
                    <label className={labelCls}>
                        <Icon name="mail" className="text-[14px] text-crimson-vivid" />
                        E-posta <span className="text-secondary/60">(opsiyonel)</span>
                    </label>
                    <input
                        type="email"
                        placeholder="ornek@firma.com"
                        value={form.email}
                        onChange={update("email")}
                        className={fieldCls}
                    />
                </div>

                {/* Kiralama başlangıç */}
                <div>
                    <label className={labelCls}>
                        <Icon name="calendar_today" className="text-[14px] text-crimson-vivid" />
                        Kiralama Başlangıcı
                    </label>
                    <input
                        required
                        type="date"
                        min={todayISO()}
                        value={form.startDate}
                        onChange={update("startDate")}
                        className={fieldCls}
                    />
                </div>

                {/* Kiralama bitiş */}
                <div>
                    <label className={labelCls}>
                        <Icon name="event_repeat" className="text-[14px] text-crimson-vivid" />
                        Kiralama Bitişi
                    </label>
                    <input
                        type="date"
                        min={form.startDate || todayISO()}
                        value={form.endDate}
                        onChange={update("endDate")}
                        className={fieldCls}
                    />
                </div>

                {/* Süre (ay) */}
                <div>
                    <label className={labelCls}>
                        <Icon name="timelapse" className="text-[14px] text-crimson-vivid" />
                        Kiralama Süresi (ay)
                    </label>
                    <input
                        required
                        type="number"
                        min="1"
                        max="24"
                        placeholder="Örn: 6"
                        value={form.months}
                        onChange={update("months")}
                        className={fieldCls}
                    />
                </div>

                {/* Araç tipi */}
                <div>
                    <label className={labelCls}>
                        <Icon name="directions_car" className="text-[14px] text-crimson-vivid" />
                        Tercih Edilen Araç Tipi
                    </label>
                    <select
                        value={form.vehicleType}
                        onChange={update("vehicleType")}
                        className={`${fieldCls} cursor-pointer`}
                    >
                        {CORPORATE_VEHICLE_TYPES.map((v) => (
                            <option key={v.value} value={v.value}>
                                {v.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Adet */}
                <div>
                    <label className={labelCls}>
                        <Icon name="inventory_2" className="text-[14px] text-crimson-vivid" />
                        Araç Adedi
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="50"
                        value={form.quantity}
                        onChange={update("quantity")}
                        className={fieldCls}
                    />
                </div>

                {/* Notlar */}
                <div className="sm:col-span-2">
                    <label className={labelCls}>
                        <Icon name="notes" className="text-[14px] text-crimson-vivid" />
                        Ek Notlar <span className="text-secondary/60">(opsiyonel)</span>
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Özel talepleriniz, şoför ihtiyacı, rota bilgisi vb."
                        value={form.notes}
                        onChange={update("notes")}
                        className={`${fieldCls} resize-none`}
                    />
                </div>

                {/* Submit */}
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container px-6 py-4 font-headline-sm text-headline-sm font-bold text-on-primary shadow-[0_10px_25px_-5px_rgba(187,0,38,0.35)] transition-all hover:bg-crimson-vivid active:scale-[0.98]"
                    >
                        <Icon name="send" className="text-[20px] transition-transform group-hover:translate-x-0.5" />
                        <span>WhatsApp ile Başvuru Gönder</span>
                    </button>
                    <p className="mt-3 text-center font-body-sm text-body-sm text-secondary">
                        Formu gönderdiğinizde WhatsApp üzerinden filo uzmanımıza ulaşır.
                        En kısa sürede size özel fiyat teklifi iletilir.
                    </p>
                </div>
            </form>
        </div>
    );
}

/* ─────────────────────────────────────────────
   ALT BİLEŞENLER
   ───────────────────────────────────────────── */

function HeroBadge({ icon, text }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-label-md text-label-md text-white backdrop-blur-md sm:px-4">
            <Icon name={icon} className="text-[16px] text-crimson-vivid sm:text-[18px]" />
            <span className="text-[11px] sm:text-[12px]">{text}</span>
        </div>
    );
}

function FieldWrapper({ children, className = "" }) {
    return (
        <div
            className={`group cursor-pointer rounded-2xl bg-canvas-offwhite/70 p-3 transition-colors hover:bg-canvas-offwhite ${className}`}
        >
            {children}
        </div>
    );
}

function FieldLabel({ icon, text }) {
    return (
        <div className="mb-1 flex items-center gap-1.5 font-label-uppercase text-label-uppercase text-secondary">
            <Icon name={icon} className="text-[14px] text-crimson-vivid" />
            <span className="text-[10px] sm:text-[11px]">{text}</span>
        </div>
    );
}

function InfoPill({ icon, text }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-offwhite px-3 py-1 font-label-md text-label-md text-charcoal-dark">
            <Icon name={icon} className="text-[14px] text-crimson-vivid" />
            <span className="text-[11px] sm:text-[12px]">{text}</span>
        </span>
    );
}

function SegmentPill({ active, onClick, icon, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`shrink-0 rounded-full px-4 py-2.5 font-label-md text-label-md font-semibold transition-all ${active
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "bg-surface-white text-charcoal-dark shadow-sm hover:bg-canvas-offwhite"
                }`}
        >
            {icon && <Icon name={icon} className="mr-1.5 inline-block text-[16px] align-text-bottom" />}
            {children}
        </button>
    );
}

/* Uzun yatay araç kartı — tam responsive */
function VehicleRow({ vehicle, days = 3 }) {
    const priceNum = priceOf(vehicle);
    const totalPrice =
        days && days !== 3
            ? `₺${(priceNum * (days / 3)).toLocaleString("tr-TR")}`
            : vehicle.price3Days;

    return (
        <article className="group flex flex-col gap-5 rounded-2xl bg-surface-white p-4 shadow-sm transition-all duration-300 hover:shadow-[0_20px_35px_-10px_rgba(187,0,38,0.12)] sm:p-6 lg:flex-row lg:items-stretch lg:gap-6 lg:p-7">
            {/* SOL: Başlık + Görsel */}
            <div className="flex w-full flex-col lg:w-[32%]">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 font-label-uppercase text-label-uppercase font-bold ${vehicle.badgeClass}`}>
                        {vehicle.badge}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-canvas-offwhite px-2.5 py-0.5 font-label-md text-label-md text-secondary">
                        <Icon name="star" fill className="text-[14px] text-amber-400" />
                        <span>{vehicle.rating}</span>
                    </span>
                </div>

                <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-charcoal-dark transition-colors group-hover:text-crimson-vivid">
                    {vehicle.name}
                </h2>
                <p className="mb-3 font-body-sm text-body-sm text-secondary">
                    {vehicle.tagline}
                </p>

                <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl bg-canvas-offwhite/50 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={vehicle.image}
                        alt={vehicle.name}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 self-start rounded-full bg-canvas-offwhite px-3 py-1 font-label-uppercase text-label-uppercase text-secondary">
                    <Icon name="check_circle" className="text-[14px] text-emerald-600" />
                    <span className="text-[10px] sm:text-[11px]">{vehicle.guarantee}</span>
                </div>
            </div>

            {/* ORTA: Teknik özellikler */}
            <div className="flex w-full flex-col justify-center lg:w-[40%]">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {vehicle.specs.map((s) => (
                        <div
                            key={s.label}
                            className="flex items-center gap-2 rounded-xl bg-canvas-offwhite/70 p-2.5"
                        >
                            <Icon name={s.icon} className="shrink-0 text-[18px] text-crimson-vivid sm:text-[20px]" />
                            <div className="min-w-0">
                                <div className="truncate font-label-uppercase text-label-uppercase text-secondary text-[9px] sm:text-[10px]">
                                    {s.label}
                                </div>
                                <div className="truncate font-label-md text-label-md font-semibold text-charcoal-dark text-[12px] sm:text-[13px]">
                                    {s.value}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 font-label-md text-label-md text-emerald-700">
                    <Icon name="verified" className="mt-0.5 shrink-0 text-[16px]" />
                    <span className="text-[11px] leading-snug sm:text-[12px]">
                        Son 24 Saate Kadar Ücretsiz İptal & Kesintisiz İade
                    </span>
                </div>
            </div>

            {/* SAĞ: Fiyat + CTA */}
            <div className="flex w-full flex-col justify-between gap-4 rounded-2xl bg-canvas-offwhite/40 p-4 sm:p-5 lg:w-[28%] lg:bg-transparent lg:p-0">
                <div>
                    {vehicle.oldPrice && (
                        <div className="font-body-sm text-body-sm text-secondary line-through">
                            {vehicle.oldPrice}
                        </div>
                    )}
                    <div className="mt-0.5 font-price-lg text-price-lg font-extrabold text-crimson-vivid">
                        {totalPrice}
                    </div>
                    <div className="font-label-md text-label-md text-secondary">
                        {days} Günlük Toplam •{" "}
                        <span className="font-semibold text-emerald-700">
                            Günlük {vehicle.dailyPrice}
                        </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 font-body-sm text-body-sm text-secondary">
                        <Icon name="shield" className="text-[14px] text-crimson-vivid" />
                        <span>KDV, Tam Kasko Dahil</span>
                    </div>
                </div>

                <a
                    href={`/arac-kiralama/${vehicle.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-container px-4 py-3 font-headline-sm text-headline-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-crimson-vivid"
                >
                    <span>Hemen Kirala</span>
                    <Icon name="arrow_forward" className="text-[18px]" />
                </a>
            </div>
        </article>
    );
}

const ADVANTAGE_TONES = {
    primary: { wrapper: "bg-primary-fixed", icon: "text-primary" },
    dark: { wrapper: "bg-charcoal-dark/10", icon: "text-charcoal-dark" },
    emerald: { wrapper: "bg-emerald-500/15", icon: "text-emerald-700" },
    neutral: { wrapper: "bg-surface-container-high", icon: "text-charcoal-dark" },
};

function AdvantageCard({ icon, tone, title, text }) {
    const t = ADVANTAGE_TONES[tone] || ADVANTAGE_TONES.primary;
    return (
        <div className="flex flex-col items-start rounded-2xl bg-surface-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${t.wrapper}`}>
                <Icon name={icon} className={`text-[26px] ${t.icon}`} />
            </div>
            <h4 className="mb-1 font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                {title}
            </h4>
            <p className="font-body-sm text-body-sm leading-relaxed text-secondary">
                {text}
            </p>
        </div>
    );
}

function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="overflow-hidden rounded-2xl bg-surface-white shadow-sm">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 p-5 text-left focus:outline-none"
            >
                <span className="font-headline-sm text-headline-sm font-bold text-charcoal-dark">
                    {question}
                </span>
                <Icon
                    name="expand_more"
                    className={`shrink-0 text-[22px] text-secondary transition-transform duration-300 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="px-5 pb-5 font-body-sm text-body-sm leading-relaxed text-secondary">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}