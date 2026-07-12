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
            {/* Aspect-ratio spacers. Landscape: fixed 4:3 on desktop; content-sized below lg. */}
            {landscape ? (
                <>
                    <div className="col-start-1 row-start-1 hidden lg:block" style={{ paddingBottom: '75%' }}></div>
                </>
            ) : (
                <div className="col-start-1 row-start-1" style={{ paddingBottom: '141.42%' }}></div>
            )}

            {/* Your content sits in the same grid cell */}
            <div
                className={`col-start-1 row-start-1 h-full p-12 max-lg:p-6 max-sm:p-5 flex flex-col ${
                    landscape ? "max-lg:h-auto" : ""
                } ${homeButton ? "pt-22 max-lg:pt-[4.5rem] max-sm:pt-[4.5rem]" : ""}`}
            >
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

                {/* Page number decorator - bottom center (desktop: floats in the aspect-ratio spacer's reserved margin) */}
                {pageNum && (
                    <div className="hidden lg:block absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[rgba(0,0,0,0.6)] mix-blend-multiply font-serif text-sm select-none">
                        {pageNum}
                    </div>
                )}

                {/* Content layer */}
                <div className={`relative z-0 flex-1 w-full min-h-0 ${landscape ? "max-lg:flex-none" : ""}`}>
                    {children}
                </div>

                {/* Page number decorator - below lg: no reserved margin exists, so render in flow instead */}
                {pageNum && (
                    <div className="lg:hidden mt-4 text-center text-[rgba(0,0,0,0.6)] mix-blend-multiply font-serif text-sm select-none">
                        {pageNum}
                    </div>
                )}
            </div>

            {/* Paper texture overlay - multiplies onto content */}
            <div
                className="pointer-events-none absolute inset-0 z-10 mix-blend-multiply opacity-[0.5]"
                style={{
                    backgroundImage: 'url("/paper-texture-tile.png")',
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
