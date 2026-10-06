"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ToastProvider from "@/components/admin/Toast";
import { logout } from "@/lib/admin/client";
import { NAV_GROUPS, groupOf } from "@/lib/admin/nav";
import AdminProgressBar from "@/components/admin/AdminProgressBar";

export default function AdminShell({ user, children }) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        setDrawerOpen(false); // sayfa değişince çekmece kapanır
    }, [pathname]);

    useEffect(() => {
        if (!drawerOpen) return;
        const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [drawerOpen]);

    return (
        <div className="flex min-h-dvh">
            <AdminProgressBar />
            
            {/* Masaüstü sidebar */}
            <aside className="ad-nav fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col lg:flex">
                <SidebarContent pathname={pathname} user={user} />
            </aside>

            {/* Mobil çekmece */}
            {drawerOpen && (
                <div className="lg:hidden">
                    <button
                        type="button"
                        aria-label="Menüyü kapat"
                        onClick={() => setDrawerOpen(false)}
                        className="fixed inset-0 z-40 bg-ad-ink/60 backdrop-blur-sm"
                    />
                    <aside className="ad-nav fixed inset-y-0 left-0 z-50 flex w-[84%] max-w-[300px] flex-col shadow-ad-lg">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Menüyü kapat"
                            className="absolute right-3 top-3.5 flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <Icon name="close" className="text-[20px]" />
                        </button>
                        <SidebarContent pathname={pathname} user={user} />
                    </aside>
                </div>
            )}

            {/* İçerik sütunu */}
            <div className="flex min-w-0 flex-1 flex-col lg:pl-[264px]">
                <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-ad-line bg-ad-surface/85 px-3 backdrop-blur-xl sm:px-6">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Menüyü aç"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink lg:hidden"
                    >
                        <Icon name="menu" className="text-[24px]" />
                    </button>

                    <Breadcrumb pathname={pathname} />

                    <div className="ms-auto flex items-center gap-1.5">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden h-9 items-center gap-1.5 rounded-lg border border-ad-line px-3 text-xs font-semibold text-ad-body transition-colors hover:border-ad-line-strong hover:bg-ad-sunken sm:flex"
                        >
                            <Icon name="open_in_new" className="text-[16px]" />
                            Siteyi gör
                        </a>
                        <UserMenu user={user} />
                    </div>
                </header>

                <main className="min-w-0 flex-1 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
                    <ToastProvider>{children}</ToastProvider>
                </main>
            </div>
        </div>
    );
}

/* ── Başlık yolu ── */
function Breadcrumb({ pathname }) {
    let group = null;
    let item = null;

    for (const g of NAV_GROUPS) {
        const found = g.items.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)));
        if (found) {
            group = g.label;
            item = found.label;
            break;
        }
    }

    return (
        <div className="flex min-w-0 items-center gap-1.5">
            {group && (
                <>
                    <span className="hidden text-sm text-ad-faint sm:inline">{group}</span>
                    <Icon name="chevron_right" className="hidden text-[16px] text-ad-faint sm:inline" />
                </>
            )}
            <span className="truncate text-sm font-bold text-ad-ink sm:text-[15px]">
                {item ?? "Yönetim Paneli"}
            </span>
        </div>
    );
}

/* ── Kullanıcı menüsü ── */
function UserMenu({ user }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, [open]);

    return (
        <div className="relative" onPointerDown={(e) => e.stopPropagation()}>
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-xl pe-1.5 ps-1.5 transition-colors hover:bg-ad-sunken"
            >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-ad-brand to-ad-brand-dark text-xs font-bold uppercase text-white shadow-ad-sm">
                    {user.name.charAt(0)}
                </span>
                <Icon name="expand_more" className="text-[18px] text-ad-muted" />
            </button>

            {open && (
                <div className="absolute end-0 top-full z-30 mt-2 w-60 overflow-hidden rounded-xl border border-ad-line bg-ad-surface shadow-ad-lg">
                    <div className="border-b border-ad-line px-4 py-3">
                        <div className="truncate text-sm font-semibold">{user.name}</div>
                        <div dir="ltr" className="truncate text-xs text-ad-muted">
                            {user.email}
                        </div>
                    </div>
                    <Link
                        href="/admin/profil"
                        className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-ad-sunken"
                    >
                        <Icon name="account_circle" className="text-[19px] text-ad-muted" />
                        Profilim
                    </Link>
                    <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 border-t border-ad-line px-4 py-3 text-start text-sm font-medium text-ad-brand transition-colors hover:bg-ad-brand-soft"
                    >
                        <Icon name="logout" className="text-[19px]" />
                        Çıkış yap
                    </button>
                </div>
            )}
        </div>
    );
}

/* ── Sidebar içeriği ── */
function SidebarContent({ pathname, user }) {
    const [open, setOpen] = useState(() => ({ [groupOf(pathname)]: true }));

    return (
        <>
            {/* Marka */}
            <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark text-sm font-extrabold text-white shadow-ad-brand">
                    R
                </span>
                <span className="flex flex-col leading-none">
                    <span className="text-[13px] font-bold tracking-[0.18em] text-white">RENTRAVEL</span>
                    <span className="mt-1 text-[10px] font-medium tracking-wide text-ad-nav-text">
                        Yönetim Paneli
                    </span>
                </span>
            </div>

            <div className="mx-5 h-px bg-white/8" />

            {/* Menü */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {NAV_GROUPS.map((group) => {
                    if (!group.label) {
                        return (
                            <div key={group.key} className="mb-3">
                                {group.items.map((item) => (
                                    <NavLink key={item.href} item={item} pathname={pathname} />
                                ))}
                            </div>
                        );
                    }

                    const isOpen = Boolean(open[group.key]);
                    const hasActive = group.items.some((i) => pathname.startsWith(i.href));

                    return (
                        <div key={group.key} className="mb-1">
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                onClick={() => setOpen((s) => ({ ...s, [group.key]: !s[group.key] }))}
                                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-[13px] font-semibold transition-colors ${hasActive ? "text-white" : "text-ad-nav-text hover:text-white"
                                    }`}
                            >
                                <Icon name={group.icon} className="shrink-0 text-[19px]" />
                                <span className="flex-1 truncate">{group.label}</span>
                                {!isOpen && hasActive && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-ad-brand" aria-hidden="true" />
                                )}
                                <Icon
                                    name="expand_more"
                                    className={`shrink-0 text-[17px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {isOpen && (
                                <div className="relative mb-2 mt-0.5 space-y-0.5 ps-5">
                                    {/* Grup altındaki dikey rehber çizgisi */}
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-y-1 start-[1.1rem] w-px bg-white/10"
                                    />
                                    {group.items.map((item) => (
                                        <NavLink key={item.href} item={item} pathname={pathname} nested />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Alt kullanıcı kartı */}
            <div className="shrink-0 border-t border-white/8 p-3">
                <Link
                    href="/admin/profil"
                    className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase text-white">
                        {user.name.charAt(0)}
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-white">{user.name}</span>
                        <span dir="ltr" className="block truncate text-[11px] text-ad-nav-text">
                            {user.email}
                        </span>
                    </span>
                    <Icon name="chevron_right" className="shrink-0 text-[16px] text-ad-nav-text" />
                </Link>
            </div>
        </>
    );
}

function NavLink({ item, pathname, nested = false }) {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${active
                ? "ad-nav-active font-semibold text-white"
                : "text-ad-nav-text hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon
                name={item.icon}
                className={`shrink-0 ${nested ? "text-[18px]" : "text-[19px]"} ${active ? "text-ad-brand" : ""}`}
            />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}