"use client";

import Stamp from "./Stamp";
import { ReactNode } from "react";

interface PaperProps {
    children: ReactNode;
    landscape?: boolean;
    id?: string;
    pageNum?: string | number;
    showHomeButton?: boolean;
    homeButtonLink?: string;
}

export default function Paper({
    children,
    landscape = false,
    id,
    pageNum,
    showHomeButton: homeButton = false,
    homeButtonLink,
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
            className={`paper relative w-full sm:w-3/4 ${landscape ? 'lg:w-full' : 'lg:w-1/2'} grid bg-[#fdf6e6] overflow-hidden rounded-[2px] isolate shadow-[0_4px_12px_rgba(0,0,0,0.1),0_8px_24px_rgba(0,0,0,0.05)] outline-0 outline-blue-500`}
        >
            {/* This pseudo-element forces the 210:297 ratio (or 4:3 for landscape on lg+) */}
            {landscape ? (
                <>
                    <div className="col-start-1 row-start-1 lg:hidden" style={{ paddingBottom: '141.42%' }}></div>
                    <div className="col-start-1 row-start-1 hidden lg:block" style={{ paddingBottom: '75%' }}></div>
                </>
            ) : (
                <div className="col-start-1 row-start-1" style={{ paddingBottom: '141.42%' }}></div>
            )}

            {/* Your content sits in the same grid cell */}
            <div className={`col-start-1 row-start-1 h-full p-12 flex flex-col ${homeButton && 'pt-22'}`}>
                {/* Home button decorator - top of page */}
                {homeButton && (
                    homeButtonLink ? (
                        <Stamp
                            href={homeButtonLink}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                            aria-label="Go back home"
                        />
                    ) : (
                        <Stamp
                            onClick={scrollToTop}
                            className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
                            aria-label="Scroll to top"
                        />
                    )
                )}

                {/* Page number decorator - bottom center */}
                {pageNum && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[rgba(0,0,0,0.6)] mix-blend-multiply font-serif text-sm">
                        {pageNum}
                    </div>
                )}

                {/* Content layer */}
                <div className="relative z-0 flex-1 w-full min-h-0">
                    {children}
                </div>
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
