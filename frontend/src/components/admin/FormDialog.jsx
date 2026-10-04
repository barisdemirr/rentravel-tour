"use client";

import { useEffect } from "react";
import Icon from "@/components/ui/Icon";

/** Küçük kayıtlar için modal form. onSubmit async olabilir. */
export default function FormDialog({ open, title, description, busy, onSubmit, onClose, saveLabel = "Kaydet", children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && !busy && onClose();
        document.addEventListener("keydown", onKey);
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previous;
        };
    }, [open, busy, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[64] flex items-end justify-center bg-ad-ink/55 backdrop-blur-sm sm:items-center sm:p-6">
            <form
                onSubmit={onSubmit}
                className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-ad-line bg-ad-surface shadow-ad-lg sm:rounded-2xl"
            >
                <div className="flex shrink-0 items-start gap-3 border-b border-ad-line px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-bold">{title}</h2>
                        {description && <p className="mt-0.5 text-xs text-ad-muted">{description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Kapat"
                        className="ms-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ad-muted transition-colors hover:bg-ad-sunken hover:text-ad-ink"
                    >
                        <Icon name="close" className="text-[20px]" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
                </div>

                <div className="flex shrink-0 items-center justify-end gap-2 border-t border-ad-line px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="h-11 rounded-xl border border-ad-line-strong px-5 text-sm font-semibold text-ad-body transition-colors hover:bg-ad-sunken disabled:opacity-50"
                    >
                        Vazgeç
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-6 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110 disabled:opacity-60"
                    >
                        {busy && <Icon name="progress_activity" className="animate-spin text-[17px]" />}
                        {saveLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}