"use client";

import Image from "next/image";
import Link from "next/link";

const wrapperClass =
    "cursor-pointer opacity-60 hover:opacity-40 outline-none rounded-full overflow-hidden";

interface StampProps {
    href?: string;
    onClick?: () => void;
    className?: string;
    "aria-label"?: string;
}

export default function Stamp({ href, onClick, className, "aria-label": ariaLabel }: StampProps) {
    const image = (
        <Image
            src="/home-stamp.png"
            alt="Home Stamp"
            width={256}
            height={256}
            className="select-none w-16 h-16 object-contain"
        />
    );

    const shared = `${wrapperClass} ${className ?? ""}`.trim();

    const tapStyle = { WebkitTapHighlightColor: "transparent" as const };

    if (href) {
        return (
            <Link href={href} className={shared} aria-label={ariaLabel} style={tapStyle}>
                {image}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={shared}
                aria-label={ariaLabel}
                style={tapStyle}
            >
                {image}
            </button>
        );
    }

    return <span className={className}>{image}</span>;
}
