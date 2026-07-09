import Link from "next/link";
import type { CSSProperties } from "react";

type PhotoStackProps = {
    slug: string;
    title: string;
    className?: string;
    style?: CSSProperties;
};

const linkHoverClass = "hover:text-primary hover:decoration-wavy hover:underline decoration-1";

const CARD_LAYERS = [
    { rotate: -4, x: -3, y: 2, opacity: 0.55 },
    { rotate: 2, x: 4, y: -2, opacity: 0.7 },
    { rotate: -1, x: -1, y: 1, opacity: 0.85 },
    { rotate: 3, x: 2, y: -1, opacity: 1 },
];

export default function PhotoStack({ slug, title, className, style }: PhotoStackProps) {
    return (
        <Link
            href={`/rabbit-holes/${slug}`}
            className={`group flex flex-col items-center gap-2 ${linkHoverClass} ${className ?? ""}`}
            style={style}
            aria-label={`Open ${title} rabbit hole`}
        >
            <span className="text-xl sm:text-base text-[rgba(0,0,0,0.85)] mix-blend-multiply select-none">
                {title}
            </span>

            <div className="relative w-[5.5rem] h-[6.5rem]">
                {CARD_LAYERS.map((layer, i) => (
                    <div
                        key={i}
                        className="absolute inset-0 rounded-[2px] bg-[#fdf6e6] border border-[rgba(0,0,0,0.08)] shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-transform duration-200 group-hover:-translate-y-0.5"
                        style={{
                            transform: `rotate(${layer.rotate}deg) translate(${layer.x}px, ${layer.y}px)`,
                            opacity: layer.opacity,
                            zIndex: i,
                        }}
                    />
                ))}
            </div>
        </Link>
    );
}
