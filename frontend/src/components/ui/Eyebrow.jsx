export default function Eyebrow({ children, className = "" }) {
    return (
        <span
            className={`flex items-center gap-2 font-label-uppercase text-label-uppercase uppercase text-crimson-vivid ${className}`}
        >
            <span className="inline-block h-[2px] w-5 rounded-full bg-crimson-vivid" />
            {children}
        </span>
    );
}