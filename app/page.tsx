import Image from "next/image";
import Paper from "./components/Paper";

export default function Home() {
    return (
        <div className="flex min-h-screen box-border items-center justify-center font-body p-4 sm:p-16">
            {/* SVG filter: turbulence generates noise; displacement warps glyph edges; blur/contrast mimics ink spread */}
            <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
                <filter id="ink" x="0%" y="0%" width="100%" height="100%">
                    {/* Organic noise texture */}
                    <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves={1} seed={1} result="noise" />
                    {/* Warp the text slightly using the noise field */}
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.25} xChannelSelector="R" yChannelSelector="G" result="wobble" />
                    {/* Tiny spread/bleed: blur + component transfer */}
                    <feGaussianBlur in="wobble" stdDeviation={0.1} result="soft" />
                    <feComponentTransfer in="soft" result="inked">
                        <feFuncA type="gamma" amplitude={1.0} exponent={1} offset={0} />
                    </feComponentTransfer>
                </filter>
            </svg>

            <main className="flex min-h-full w-lg sm:w-2xl flex-col items-center justify-between gap-16">
                <Paper>
                    <div className="h-full w-full grid grid-rows-3 place-items-center">
                        <Image src="/seal.png" alt="Ferguson Seal" width={120} height={120} />
                        <h1 className="text-center font-heading mix-blend-multiply filter-[url(#ink)]">
                            <span className="block text-7xl italic text-[#910A07]">ALAIR</span>
                            <span className="block text-3xl tracking-wide not-italic">FERGUSON</span>
                            <span className="block text-3xl tracking-wide not-italic">HAUTZINGER</span>
                        </h1>
                        <ol className="list-none text-xl sm:text-base list-inside text-center text-[rgba(0,0,0,0.85)] mix-blend-multiply">
                            <li>I. Email</li>
                            <li>II. Resume</li>
                            <li>III. LinkedIn</li>
                        </ol>
                    </div>
                </Paper>
            </main>
        </div>
    );
}
