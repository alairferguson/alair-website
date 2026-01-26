import { ReactNode } from "react";

interface PaperProps {
    children: ReactNode;
}

export default function Paper({ children }: PaperProps) {
    return (
        <div className="paper relative w-full sm:w-3/4 aspect-210/297 p-12 sm:p-24 bg-[#fdf6e6] overflow-hidden rounded-[2px] isolate shadow-[0_4px_12px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.05)]">
            {/* Content layer */}
            <div className="relative z-0 h-full w-full">
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
