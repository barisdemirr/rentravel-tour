import Link from "next/link";
import "@/styles/globals.css";

export const metadata = {
    title: "Sayfa Bulunamadı | Rentravel Turizm",
    robots: { index: false, follow: false },
};

export default function RootNotFound() {
    return (
        <html lang="tr">
            <body>
                <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-surface px-5 text-center">
                    <span
                        aria-hidden="true"
                        className="bg-gradient-to-b from-crimson-vivid to-[#8f0019] bg-clip-text text-[88px] font-extrabold leading-none tracking-tighter text-transparent"
                    >
                        404
                    </span>

                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-extrabold tracking-tight text-charcoal-dark">
                        Bu sayfayı bulamadık.
                    </h1>

                    <p className="max-w-sm font-body-md text-body-md text-secondary">
                        Aradığınız sayfa kaldırılmış veya adres yanlış yazılmış olabilir.
                    </p>

                    <Link
                        href="/"
                        className="mt-2 rounded-2xl bg-primary-container px-7 py-3.5 font-label-uppercase text-label-uppercase font-bold tracking-wider text-on-primary transition-colors hover:bg-crimson-vivid"
                    >
                        Ana sayfaya dön
                    </Link>
                </div>
            </body>
        </html>
    );
}