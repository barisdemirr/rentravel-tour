import Icon from "@/components/ui/Icon";
import LoginForm from "./LoginForm";

export const metadata = {
    title: "Giriş | Rentravel Yönetim",
    robots: { index: false, follow: false },
};

const POINTS = [
    { icon: "inventory_2", text: "Araç, tur ve bungalov içeriklerini tek yerden yönetin" },
    { icon: "payments", text: "Dönemsel fiyatlar, yaş indirimleri ve sefer kontenjanları" },
    { icon: "translate", text: "Türkçe, İngilizce ve Arapça içerik tek formda" },
];

export default function LoginPage() {
    return (
        <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
            {/* Marka paneli: sadece masaüstü */}
            <div className="ad-nav relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-ad-brand/25 blur-[130px]"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-52 -right-24 h-[460px] w-[460px] rounded-full bg-white/5 blur-[120px]"
                />

                <div className="relative flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark text-base font-extrabold text-white shadow-ad-brand">
                        R
                    </span>
                    <span className="text-sm font-bold tracking-[0.2em] text-white">RENTRAVEL</span>
                </div>

                <div className="relative max-w-md">
                    <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
                        Karadeniz'in en iyi rotaları, tek panelden.
                    </h2>
                    <ul className="mt-9 flex flex-col gap-4">
                        {POINTS.map((p) => (
                            <li key={p.icon} className="flex items-start gap-3 text-sm text-white/70">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-ad-brand">
                                    <Icon name={p.icon} className="text-[19px]" />
                                </span>
                                <span className="pt-2">{p.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-xs text-white/35">
                    © {new Date().getFullYear()} Rentravel Turizm · TÜRSAB belgeli acente
                </p>
            </div>

            {/* Form */}
            <div className="flex items-center justify-center px-4 py-12 sm:px-8">
                <LoginForm />
            </div>
        </div>
    );
}