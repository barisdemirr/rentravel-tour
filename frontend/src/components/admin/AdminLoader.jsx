/**
 * Panelin markalı yükleme ekranı. Sayfa geçişlerinde loading.jsx üzerinden gösterilir.
 */
export default function AdminLoader({ label = "Veriler hazırlanıyor" }) {
    return (
        <div role="status" aria-live="polite" className="flex min-h-[65vh] w-full items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
                {/* Halkalar + logo */}
                <div className="relative h-36 w-36">
                    <div className="admin-loader-pulse absolute -inset-4 rounded-full bg-crimson-vivid/20 blur-2xl" />
                    <div className="admin-loader-ring absolute inset-0 rounded-full" />
                    <div className="absolute inset-[7px] rounded-full bg-surface-white shadow-[inset_0_2px_10px_rgba(15,17,21,0.08)]" />
                    <div className="admin-loader-spin-rev absolute inset-[18px] rounded-full border-2 border-dashed border-crimson-vivid/25" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Rentravel" className="admin-loader-breathe h-16 w-16 object-contain" />
                    </div>
                </div>

                {/* Panel kimliği */}
                <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-crimson-vivid/30 bg-crimson-vivid/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-crimson-vivid">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-crimson-vivid" />
                    Admin Console
                </span>

                <p className="mt-3 font-headline-sm text-headline-sm font-extrabold tracking-tight text-charcoal-dark">
                    Rentravel Yönetim Paneli
                </p>
                <p className="mt-1 font-body-sm text-body-sm text-secondary">
                    {label}
                    <span className="admin-loader-dots" />
                </p>

                {/* Kayan ince çubuk */}
                <div className="mt-5 h-1 w-52 overflow-hidden rounded-full bg-surface-variant">
                    <div className="admin-loader-slide h-full w-1/3 rounded-full bg-gradient-to-r from-primary-container to-crimson-vivid" />
                </div>
            </div>
        </div>
    );
}