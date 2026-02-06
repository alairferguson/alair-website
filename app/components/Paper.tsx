import Image from "next/image";
import { ReactNode } from "react";

interface PaperProps {
    children: ReactNode;
    landscape?: boolean;
    id?: string;
    pageNum?: string | number;
    showHomeButton?: boolean;
}

export default function Paper({
    children,
    landscape = false,
    id,
    pageNum,
    showHomeButton = false,
}: PaperProps) {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div
            id={id}
            className={`paper relative ${landscape ? 'w-full sm:w-[150%] sm:max-w-[90vw]' : 'w-full sm:w-3/4 aspect-210/297'} p-12 bg-[#fdf6e6] overflow-hidden rounded-[2px] isolate shadow-[0_4px_12px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.05)] flex flex-col`}
        >
            {/* Home button decorator - top of page */}
            {showHomeButton && (
                <button
                    onClick={scrollToTop}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-20 cursor-pointer hover:opacity-80 active:scale-95 transition-all duration-200 outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                    aria-label="Scroll to top"
                >
                    <Image
                        src="/home-stamp.png"
                        alt="Home Stamp"
                        width={256}
                        height={256}
                        className="select-none w-16 h-16 object-contain"
                    />
                </button>
            )}

            {/* Page number decorator - bottom center */}
            {pageNum && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[rgba(0,0,0,0.6)] mix-blend-multiply font-serif text-sm">
                    {pageNum}
                </div>
            )}

            {/* Content layer */}
            <div className="relative z-0 flex-1 w-full">
                {children}
            </div>

            {/* Paper texture overlay - multiplies onto content */}
            <div
                className="pointer-events-none absolute inset-0 z-10 mix-blend-multiply opacity-[0.5]"
                style={{
                    backgroundImage: 'url("paper-texture-tile.png")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '128px 128px',
                }}
                aria-hidden="true"
            />

            {/* Subtle vignette/edge darkening for realism */}
            <div
                className="pointer-events-none absolute inset-0 z-11 opacity-5"
                style={{
                    boxShadow: 'inset 0 0 128px 64px black',
                }}
                aria-hidden="true"
            />

            {/* Subtle light edge highlight to separate from shadow */}
            <div
                className="pointer-events-none absolute inset-0 z-12 opacity-50"
                style={{
                    boxShadow: 'inset 0.3px 0.5px 1px 1px white',
                }}
                aria-hidden="true"
            />
        </div>
    );
}
