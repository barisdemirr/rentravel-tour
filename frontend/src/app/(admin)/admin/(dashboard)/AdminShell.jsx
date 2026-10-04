"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { logout } from "@/lib/admin/client";
import { NAV_GROUPS, groupOf } from "@/lib/admin/nav";

export default function AdminShell({ user, children }) {
    const pathname = usePathname();
    const [drawerOpen, setDrawerOpen] = useState(false);

    /* Sayfa değişince çekmece kapanır */
    useEffect(() => {
        setDrawerOpen(false);
    }, [pathname]);

    /* Çekmece açıkken arka plan kaymasın, Esc kapatsın */
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
            {/* Masaüstü: sabit sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[var(--ad-sidebar)] lg:flex">
                <SidebarContent pathname={pathname} user={user} />
            </aside>

            {/* Mobil: çekmece */}
            {drawerOpen && (
                <>
                    <button
                        type="button"
                        aria-label="Menüyü kapat"
                        onClick={() => setDrawerOpen(false)}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    />
                    <aside className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-xs flex-col bg-[var(--ad-sidebar)] shadow-2xl lg:hidden">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(false)}
                            aria-label="Menüyü kapat"
                            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <Icon name="close" className="text-[22px]" />
                        </button>
                        <SidebarContent pathname={pathname} user={user} />
                    </aside>
                </>
            )}

            {/* İçerik */}
            <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
                <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--ad-line)] bg-[var(--ad-surface)]/95 px-3 backdrop-blur sm:px-5">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Menüyü aç"
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ad-muted)] transition-colors hover:bg-[var(--ad-bg)] hover:text-[var(--ad-text)] lg:hidden"
                    >
                        <Icon name="menu" className="text-[24px]" />
                    </button>

                    <span className="truncate text-sm font-semibold">{currentTitle(pathname)}</span>

                    <div className="ms-auto flex items-center gap-1">
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Siteyi aç"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ad-muted)] transition-colors hover:bg-[var(--ad-bg)] hover:text-[var(--ad-text)]"
                        >
                            <Icon name="open_in_new" className="text-[20px]" />
                        </a>
                        <button
                            type="button"
                            onClick={logout}
                            title="Çıkış yap"
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--ad-muted)] transition-colors hover:bg-[var(--ad-brand-soft)] hover:text-[var(--ad-brand)]"
                        >
                            <Icon name="logout" className="text-[20px]" />
                        </button>
                    </div>
                </header>

                <main className="min-w-0 flex-1 p-3 sm:p-5 lg:p-7">{children}</main>
            </div>
        </div>
    );
}

function currentTitle(pathname) {
    for (const group of NAV_GROUPS) {
        const item = group.items.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)));
        if (item) return item.label;
    }
    return "Yönetim Paneli";
}

function SidebarContent({ pathname, user }) {
    const [open, setOpen] = useState(() => ({ [groupOf(pathname)]: true }));

    return (
        <>
            {/* Logo */}
            <div className="flex h-14 shrink-0 items-center gap-2.5 px-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ad-brand)] text-sm font-extrabold text-white">
                    R
                </span>
                <span className="text-sm font-bold tracking-wide text-white">RENTRAVEL</span>
            </div>

            {/* Menü */}
            <nav className="flex-1 overflow-y-auto px-3 pb-4">
                {NAV_GROUPS.map((group) => {
                    if (!group.label) {
                        return (
                            <div key={group.key} className="mb-1">
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
                                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition-colors ${hasActive ? "text-white" : "text-[var(--ad-sidebar-muted)] hover:text-white"
                                    }`}
                            >
                                <Icon name={group.icon} className="shrink-0 text-[20px]" />
                                <span className="flex-1 truncate">{group.label}</span>
                                <Icon
                                    name="expand_more"
                                    className={`shrink-0 text-[18px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                                />
                            </button>

                            {isOpen && (
                                <div className="mt-0.5 space-y-0.5 ps-3">
                                    {group.items.map((item) => (
                                        <NavLink key={item.href} item={item} pathname={pathname} nested />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Kullanıcı */}
            <div className="shrink-0 border-t border-white/10 px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase text-white">
                        {user.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                        <div className="truncate text-xs text-[var(--ad-sidebar-muted)]">{user.email}</div>
                    </div>
                </div>
            </div>
        </>
    );
}

function NavLink({ item, pathname, nested = false }) {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);

    return (
        <Link
            href={item.href}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${active
                ? "bg-[var(--ad-brand)] font-semibold text-white"
                : "text-[var(--ad-sidebar-muted)] hover:bg-white/5 hover:text-white"
                }`}
        >
            <Icon name={item.icon} className={`shrink-0 ${nested ? "text-[18px]" : "text-[20px]"}`} />
            <span className="truncate">{item.label}</span>
        </Link>
    );
}