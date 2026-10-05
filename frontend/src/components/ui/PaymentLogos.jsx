/**
 * Ödeme yöntemi simgeleri. Markaların tanınır sadeleştirilmiş çizimleri.
 * Canlıya çıkmadan önce her markanın resmi basın varlığıyla değiştirilmeli.
 */
export default function PaymentLogos() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <Card label="Visa">
                <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-hidden="true">
                    <path
                        fill="#1A1F71"
                        d="M19.6 15.4h-3.9L18.1.7h3.9l-2.4 14.7Zm-7.2-14.7-3.7 10.1-.4-2.2L7 2.9s-.2-2.2-2.9-2.2H.1L0 1.1s3 .6 6.4 2.7l3.4 11.6h4.1L20.1.7h-4.1l-3.6 0ZM44.4 15.4H48L44.9.7h-3.2c-1.5 0-1.8 1.1-1.8 1.1l-5.8 13.6h4.1l.8-2.2h5l.4 2.2Zm-4.3-5.3 2.1-5.7 1.2 5.7h-3.3ZM34.9 4.3l.6-3.3S33.8.3 32 .3c-1.9 0-6.5.8-6.5 4.9 0 3.8 5.3 3.9 5.3 5.9s-4.8 1.6-6.4.3l-.6 3.4s1.7.8 4.4.8c2.6 0 6.6-1.4 6.6-5.1 0-3.9-5.4-4.2-5.4-5.9 0-1.7 3.8-1.5 5.5-.3Z"
                    />
                </svg>
            </Card>

            <Card label="Mastercard">
                <svg viewBox="0 0 40 24" className="h-5 w-auto" aria-hidden="true">
                    <circle cx="15" cy="12" r="11" fill="#EB001B" />
                    <circle cx="25" cy="12" r="11" fill="#F79E1B" />
                    <path
                        fill="#FF5F00"
                        d="M20 3.6a11 11 0 0 0 0 16.8 11 11 0 0 0 0-16.8Z"
                    />
                </svg>
            </Card>

            <Card label="American Express">
                <svg viewBox="0 0 48 16" className="h-4 w-auto" aria-hidden="true">
                    <rect width="48" height="16" rx="2" fill="#006FCF" />
                    <text
                        x="24"
                        y="11.2"
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        letterSpacing="0.5"
                    >
                        AMEX
                    </text>
                </svg>
            </Card>

            <Card label="Discover">
                <svg viewBox="0 0 64 16" className="h-4 w-auto" aria-hidden="true">
                    <text
                        x="2"
                        y="12"
                        fill="#1A1F71"
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                    >
                        DISC
                    </text>
                    <text
                        x="31"
                        y="12"
                        fill="#4D4D4D"
                        fontSize="10"
                        fontWeight="400"
                        fontFamily="Arial, Helvetica, sans-serif"
                    >
                        VER
                    </text>
                    <circle cx="58" cy="8" r="5" fill="#F76B1C" />
                </svg>
            </Card>

            <Card label="PayPal">
                <svg viewBox="0 0 56 16" className="h-4 w-auto" aria-hidden="true">
                    <path
                        fill="#003087"
                        d="M6.6 1.5H2.3c-.3 0-.6.2-.6.5L0 14.1c0 .2.1.4.4.4h2c.3 0 .6-.2.6-.5l.5-3.2c0-.3.3-.5.6-.5h1.4c2.8 0 4.5-1.4 4.9-4.1.2-1.2 0-2.1-.5-2.8-.6-.7-1.7-1-3.3-1Zm.5 4.1c-.2 1.6-1.4 1.6-2.5 1.6h-.7L4.4 4c0-.2.2-.3.3-.3h.3c.8 0 1.5 0 1.9.4.2.3.3.7.2 1.2Z"
                    />
                    <path
                        fill="#009CDE"
                        d="M20.3 5.5h-2c-.2 0-.3.1-.4.3l-.1.6-.1-.2c-.4-.6-1.3-.8-2.2-.8-2.1 0-3.9 1.6-4.2 3.8-.2 1.1.1 2.2.7 2.9.6.7 1.4.9 2.4.9 1.7 0 2.6-1.1 2.6-1.1l-.1.6c0 .2.1.4.4.4h1.8c.3 0 .6-.2.6-.5l1.1-6.6c0-.2-.1-.4-.4-.4Zm-2.8 3.7c-.2 1.1-1 1.8-2.1 1.8-.5 0-1-.2-1.2-.5-.3-.3-.4-.8-.3-1.3.2-1.1 1.1-1.8 2.1-1.8.5 0 .9.2 1.2.5.3.4.4.8.3 1.3Z"
                    />
                    <path
                        fill="#003087"
                        d="M30.9 5.5h-2c-.2 0-.4.1-.5.3l-2.8 4-1.2-3.9c-.1-.2-.3-.4-.5-.4h-2c-.2 0-.4.2-.3.5l2.2 6.5-2.1 2.9c-.2.2 0 .5.3.5h2c.2 0 .4-.1.5-.3l6.7-9.6c.2-.2 0-.5-.3-.5Z"
                    />
                    <path
                        fill="#009CDE"
                        d="M37.4 1.5h-4.3c-.3 0-.6.2-.6.5l-1.7 11.1c0 .2.1.4.4.4h2.2c.2 0 .4-.2.4-.4l.5-3.3c0-.3.3-.5.6-.5h1.4c2.8 0 4.5-1.4 4.9-4.1.2-1.2 0-2.1-.5-2.8-.6-.7-1.7-.9-3.3-.9Zm.5 4.1c-.2 1.6-1.4 1.6-2.5 1.6h-.7L35.2 4c0-.2.2-.3.3-.3h.3c.8 0 1.5 0 1.9.4.2.3.3.7.2 1.2Z"
                    />
                    <path
                        fill="#009CDE"
                        d="M51.1 5.5h-2c-.2 0-.3.1-.4.3l-.1.6-.1-.2c-.4-.6-1.3-.8-2.2-.8-2.1 0-3.9 1.6-4.2 3.8-.2 1.1.1 2.2.7 2.9.6.7 1.4.9 2.4.9 1.7 0 2.6-1.1 2.6-1.1l-.1.6c0 .2.1.4.4.4h1.8c.3 0 .6-.2.6-.5l1.1-6.6c0-.2-.1-.4-.5-.4Zm-2.8 3.7c-.2 1.1-1 1.8-2.1 1.8-.5 0-1-.2-1.2-.5-.3-.3-.4-.8-.3-1.3.2-1.1 1.1-1.8 2.1-1.8.5 0 .9.2 1.2.5.3.4.4.8.3 1.3ZM53.5 1.8l-1.8 11.3c0 .2.1.4.4.4h1.7c.3 0 .6-.2.6-.5l1.7-11.1c0-.2-.1-.4-.4-.4h-1.9c-.2 0-.3.1-.3.3Z"
                    />
                </svg>
            </Card>
        </div>
    );
}

function Card({ label, children }) {
    return (
        <span
            title={label}
            aria-label={label}
            className="flex h-9 w-14 items-center justify-center rounded-lg bg-white px-2 shadow-sm"
        >
            {children}
        </span>
    );
}