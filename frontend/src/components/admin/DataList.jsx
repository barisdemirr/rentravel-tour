"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";

/**
 * columns: [{ key, header, render(row), className, hideOnMobile, primary }]
 *   primary: mobil kartta başlık olarak kullanılır
 * actions: (row) => [{ label, icon, href | onClick, danger }]
 */
export default function DataList({ rows, columns, actions, keyOf = (r) => r.id, empty }) {
    if (rows.length === 0) return empty ?? null;

    const primary = columns.find((c) => c.primary) ?? columns[0];
    const rest = columns.filter((c) => c !== primary && !c.hideOnMobile);

    return (
        <>
            {/* Masaüstü: tablo */}
            <div className="ad-card hidden overflow-hidden lg:block">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-ad-line bg-ad-sunken">
                            {columns.map((c) => (
                                <th
                                    key={c.key}
                                    className={`px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-ad-muted ${c.className ?? ""}`}
                                >
                                    {c.header}
                                </th>
                            ))}
                            {actions && <th className="w-px px-4 py-3" />}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr
                                key={keyOf(row)}
                                className="border-b border-ad-line last:border-0 transition-colors hover:bg-ad-sunken/60"
                            >
                                {columns.map((c) => (
                                    <td key={c.key} className={`px-4 py-3 align-middle ${c.className ?? ""}`}>
                                        {c.render(row)}
                                    </td>
                                ))}
                                {actions && (
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {actions(row).map((a) => (
                                                <ActionButton key={a.label} action={a} />
                                            ))}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobil: kartlar */}
            <div className="flex flex-col gap-3 lg:hidden">
                {rows.map((row) => (
                    <div key={keyOf(row)} className="ad-card p-4">
                        <div className="mb-3">{primary.render(row)}</div>

                        {rest.length > 0 && (
                            <dl className="flex flex-col gap-2 border-t border-ad-line pt-3">
                                {rest.map((c) => (
                                    <div key={c.key} className="flex items-start justify-between gap-3">
                                        <dt className="shrink-0 text-xs font-semibold text-ad-muted">{c.header}</dt>
                                        <dd className="min-w-0 text-end text-sm">{c.render(row)}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}

                        {actions && (
                            <div className="mt-3 flex items-center gap-2 border-t border-ad-line pt-3">
                                {actions(row).map((a) => (
                                    <ActionButton key={a.label} action={a} wide />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
}

function ActionButton({ action, wide = false }) {
    const cls = `flex h-9 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${wide ? "flex-1 px-3" : "w-9"
        } ${action.danger
            ? "text-ad-brand hover:bg-ad-brand-soft"
            : "text-ad-body hover:bg-ad-sunken"
        }`;

    const content = (
        <>
            <Icon name={action.icon} className="text-[18px]" />
            <span className={wide ? "" : "sr-only"}>{action.label}</span>
        </>
    );

    if (action.href) {
        return (
            <Link href={action.href} className={cls} title={action.label}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" onClick={action.onClick} className={cls} title={action.label}>
            {content}
        </button>
    );
}

/* ── Sayfa başlığı ── */
export function PageHeader({ title, description, action }) {
    return (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h1>
                {description && <p className="mt-1 text-sm text-ad-muted">{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function NewButton({ href, label = "Yeni Ekle" }) {
    return (
        <Link
            href={href}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-ad-brand to-ad-brand-dark px-5 text-sm font-bold text-white shadow-ad-brand transition-all hover:brightness-110 active:scale-[0.99]"
        >
            <Icon name="add" className="text-[19px]" />
            {label}
        </Link>
    );
}

/* ── Boş ve hata durumları ── */
export function EmptyState({ icon = "inbox", title, text, children }) {
    return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ad-line-strong bg-ad-surface px-5 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ad-sunken text-ad-brand">
                <Icon name={icon} className="text-[26px]" />
            </span>
            <h3 className="text-base font-bold">{title}</h3>
            {text && <p className="max-w-sm text-sm text-ad-muted">{text}</p>}
            {children}
        </div>
    );
}

/* ── Durum rozeti ── */
export function StatusBadge({ active }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${active ? "bg-ad-ok-soft text-ad-ok" : "bg-ad-sunken text-ad-muted"
                }`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-ad-ok" : "bg-ad-faint"}`} />
            {active ? "Yayında" : "Pasif"}
        </span>
    );
}