"use client";

/* Ödeme sağlayıcı logoları — inline SVG, harici dosya yok */

const LOGOS = {
    visa: (
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Visa">
            <path d="M19.5 0.5h-4L13 11h2.5l.6-1.8h3l.4 1.8h2.6L19.5.5zm-2.6 6.7l1.2-3.7.7 3.7h-1.9zM30 4.2c-.6-.3-1.6-.6-2.8-.6-3.1 0-5.2 1.6-5.2 3.9 0 1.7 1.3 2.6 2.3 3.2 1 .5 1.3.9 1.3 1.4 0 .7-.8 1-1.6 1-1.3 0-2.1-.2-3.2-.8l-.5-.2-.4 2.7c.8.4 2.3.7 3.8.7 3.3 0 5.4-1.6 5.4-4 0-1.3-.8-2.4-2.4-3.2-1-.5-1.6-.8-1.6-1.3 0-.4.5-.9 1.6-.9 1 0 1.7.2 2.6.6l.3.1.4-2.6zM40 0.5h-2c-.6 0-1.1.4-1.4 1L32 11h2.7l.5-1.5h3.4l.3 1.5H41L40 0.5zm-3.3 6.7l1.4-3.9.8 3.9h-2.2zM24.5 0.5L21.9 11h2.6L27 0.5h-2.5z"
                fill="#1A1F71" />
        </svg>
    ),
    mastercard: (
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Mastercard">
            <circle cx="18" cy="8" r="7.5" fill="#EB001B" />
            <circle cx="30" cy="8" r="7.5" fill="#F79E1B" />
            <path d="M24 2.5a7.5 7.5 0 000 11 7.5 7.5 0 000-11z" fill="#FF5F00" />
        </svg>
    ),
    applepay: (
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Apple Pay">
            <path d="M9.5 2.7c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1zM10.3 3.9c-1.2-.1-2.3.7-2.8.7-.6 0-1.5-.7-2.4-.6-1.3 0-2.4.7-3.1 1.9-1.3 2.3-.3 5.7 1 7.5.6.9 1.4 1.8 2.4 1.8 1 0 1.3-.6 2.5-.6s1.5.6 2.5.6c1 0 1.7-.9 2.4-1.8.7-1.1 1-2.1 1-2.2 0 0-2-.8-2-3 0-1.9 1.5-2.8 1.6-2.8-.9-1.3-2.3-1.5-2.8-1.5zM21.5 1.2h-3.6v12h2.1V8.8h1.6c2 0 3.4-1.4 3.4-3.8 0-2.4-1.4-3.8-3.5-3.8zm-.2 6h-1.3V3h1.3c1.4 0 2.2.8 2.2 2.1 0 1.4-.8 2.2-2.2 2.2zM31.4 12c-.1-.6-.1-1.2-.1-1.8V5.6c0-1.9-1.1-2.7-2.9-2.7-1.6 0-2.7.8-3 2.3h1.9c.1-.5.5-.8 1.1-.8.7 0 1 .3 1 1v.6c-1.6.1-3.7.3-3.7 2.5 0 1.3 1 2.2 2.4 2.2 1.1 0 1.8-.5 2.3-1.2.3.5.6 1 1.1 1.2v-1.7zm-2-1.2c0 .5-.1 1-.5 1.3-.4.3-.8.4-1.2.4-.7 0-1.2-.4-1.2-1 0-1.1 1.2-1.4 2.9-1.4v.7zM42.6 3.1h-2l-2 6.1-2-6.1h-2.1l3.1 8.5c-.2.6-.6 1-1.2 1-.3 0-.6 0-.9-.1v1.6c.3.1.6.1 1 .1 1.3 0 2.2-.8 2.8-2.4l3.3-8.7z"
                fill="currentColor" />
        </svg>
    ),
    discover: (
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="Discover">
            <path d="M8.7 8.5c0 2.7-2.2 4.9-5 4.9H0V3.6h3.7c2.8 0 5 2.2 5 4.9z" fill="#F27712" />
            <path d="M3.4 4.4H1.6v8.2h1.8c2 0 3.4-1.7 3.4-4.1S5.4 4.4 3.4 4.4z" fill="#fff" />
            <path d="M22 8.5c0 2.9-2.4 5.3-5.3 5.3s-5.3-2.4-5.3-5.3 2.4-5.3 5.3-5.3S22 5.6 22 8.5z" fill="#fff" />
            <path d="M16.6 3.4c-2.9 0-5.3 2.3-5.3 5.2 0 2.3 1.5 4.2 3.6 4.9.1 0 .2 0 .3-.1 2.4-.5 4.1-2.6 4.1-5.1 0-2.7-2.1-4.9-2.7-4.9z"
                fill="#F27712" />
            <text x="24" y="12" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#1A1F71">DISCOVER</text>
        </svg>
    ),
    paypal: (
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="PayPal">
            <path d="M8.7 3.2c.4 2.4-.9 4.8-3.5 4.8H3.9L3 13H0l2.3-12h4.5c1.5 0 2.5.8 2.9 2.2z" fill="#003087" />
            <path d="M11.3 6.5c.5 2.8-1.4 5.4-4.5 5.4H5.6L4.7 17H1.6L4 5h4.1c1.8 0 2.9 1 3.2 2.6h-.1z" fill="#0070E0" />
            <text x="13" y="12" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#003087">Pay</text>
            <text x="24" y="12" fontFamily="Arial" fontWeight="bold" fontSize="9" fill="#0070E0">Pal</text>
        </svg>
    ),
    amex: (
        <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-label="American Express">
            <rect width="48" height="16" rx="2" fill="#006FCF" />
            <text x="24" y="11" fontFamily="Arial" fontWeight="bold" fontSize="8" fill="#fff" textAnchor="middle">
                AMEX
            </text>
        </svg>
    ),
};

export default function PaymentLogos() {
    const order = ["visa", "mastercard", "applepay", "discover", "paypal", "amex"];

    return (
        <ul className="flex flex-wrap items-center gap-3">
            {order.map((key) => (
                <li
                    key={key}
                    className="flex h-8 min-w-[52px] items-center justify-center rounded-lg bg-surface-white px-2.5 py-1.5 shadow-sm transition-opacity hover:opacity-80"
                >
                    {LOGOS[key]}
                </li>
            ))}
        </ul>
    );
}