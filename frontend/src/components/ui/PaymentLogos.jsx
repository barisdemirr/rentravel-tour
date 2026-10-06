/**
 * Ödeme yöntemi logoları.
 *
 * Dosyalar public/payments/ altında, PNG. Her markanın dosyası farklı oranda
 * ve farklı boşlukla geldiği için tek bir kutuya object-contain ile oturtulur;
 * scale değeri görsel ağırlığı dengeler (kare logolar aynı yükseklikte daha
 * iri görünür, onlar biraz küçültülür).
 */

const METHODS = [
    { name: "Visa", file: "visa.png", scale: 1 },
    { name: "Mastercard", file: "mastercard.png", scale: 0.82 },
    { name: "American Express", file: "amex.png", scale: 0.88 },
    { name: "Discover", file: "discover.png", scale: 1 },
    { name: "PayPal", file: "paypal.png", scale: 0.95 },
];

export default function PaymentLogos() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            {METHODS.map((method) => (
                <span
                    key={method.name}
                    title={method.name}
                    className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white px-2 shadow-sm"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`/payments/${method.file}`}
                        alt={method.name}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full object-contain"
                        style={{ transform: `scale(${method.scale})` }}
                    />
                </span>
            ))}
        </div>
    );
}