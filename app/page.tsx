export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ background: "#c4bdb0" }}>
            {/* Parchment container with tape */}
            <div className="relative w-full max-w-md">
                {/* Tape pieces - top */}
                <div
                    className="absolute -top-3 -left-3 w-16 h-8 rotate-[-40deg] z-10"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.6) 100%)",
                        boxShadow: "1px 1px 4px rgba(0,0,0,0.1)",
                    }}
                />
                <div
                    className="absolute -top-3 -right-3 w-16 h-8 rotate-[40deg] z-10"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.6) 100%)",
                        boxShadow: "1px 1px 4px rgba(0,0,0,0.1)",
                    }}
                />
                {/* Tape pieces - bottom */}
                <div
                    className="absolute -bottom-3 -left-3 w-16 h-8 rotate-[40deg] z-10"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.6) 100%)",
                        boxShadow: "1px 1px 4px rgba(0,0,0,0.1)",
                    }}
                />
                <div
                    className="absolute -bottom-3 -right-3 w-16 h-8 rotate-[-40deg] z-10"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(245,245,245,0.6) 100%)",
                        boxShadow: "1px 1px 4px rgba(0,0,0,0.1)",
                    }}
                />

                {/* Parchment paper */}
                <div
                    className="relative px-8 sm:px-12 py-12 sm:py-16 flex flex-col items-center overflow-hidden"
                    style={{
                        background: "linear-gradient(180deg, #f8f4eb 0%, #f0ebe0 30%, #ebe6d8 70%, #e8e2d4 100%)",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Subtle paper texture overlay */}
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        }}
                    />

                    {/* Top emblems row */}
                    <div className="relative flex items-center justify-center w-full mb-6">
                        {/* Left emblem - Atom */}
                        <div className="absolute left-4 sm:left-8 w-9 h-9 flex items-center justify-center">
                            <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
                                <ellipse cx="20" cy="20" rx="16" ry="6" stroke="#9d5c5c" strokeWidth="1.2" transform="rotate(0 20 20)" />
                                <ellipse cx="20" cy="20" rx="16" ry="6" stroke="#9d5c5c" strokeWidth="1.2" transform="rotate(60 20 20)" />
                                <ellipse cx="20" cy="20" rx="16" ry="6" stroke="#9d5c5c" strokeWidth="1.2" transform="rotate(-60 20 20)" />
                                <circle cx="20" cy="20" r="2.5" fill="#9d5c5c" />
                            </svg>
                        </div>

                        {/* Center Wax Seal */}
                        <div className="relative">
                            {/* Outer wax blob with irregular edge */}
                            <div
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
                                style={{
                                    background: "radial-gradient(circle at 35% 35%, #a85454 0%, #7a2e2e 35%, #5c1f1f 70%, #4a1818 100%)",
                                    boxShadow: "inset 3px 3px 10px rgba(255,255,255,0.15), inset -3px -3px 10px rgba(0,0,0,0.4), 3px 5px 15px rgba(0,0,0,0.35)",
                                }}
                            >
                                {/* Inner circle with belt design */}
                                <div
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-2 border-[#4a1818]/50"
                                    style={{
                                        background: "radial-gradient(circle at 40% 40%, #8c3535 0%, #6a2525 50%, #551e1e 100%)",
                                    }}
                                >
                                    {/* Motto text ring */}
                                    <svg viewBox="0 0 100 100" className="absolute w-20 h-20 sm:w-24 sm:h-24">
                                        <defs>
                                            <path id="textCircle" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
                                        </defs>
                                        <text className="fill-[#d4a574] text-[6.5px] sm:text-[7px]" style={{ fontFamily: "serif", letterSpacing: "0.5px" }}>
                                            <textPath href="#textCircle" startOffset="3%">
                                                DULCIUS · EX · ASPERIS
                                            </textPath>
                                        </text>
                                    </svg>

                                    {/* Thistle emblem */}
                                    <div className="flex flex-col items-center">
                                        <svg viewBox="0 0 40 55" className="w-10 h-12 sm:w-11 sm:h-14" fill="none">
                                            {/* Thistle head - pineapple shape */}
                                            <ellipse cx="20" cy="16" rx="7" ry="10" fill="#d4a574" />
                                            {/* Thistle crown spikes */}
                                            <path d="M13 10 L15 15" stroke="#d4a574" strokeWidth="1.5" />
                                            <path d="M11 7 L14 13" stroke="#d4a574" strokeWidth="1.5" />
                                            <path d="M16 5 L17 12" stroke="#d4a574" strokeWidth="1.5" />
                                            <path d="M20 3 L20 11" stroke="#d4a574" strokeWidth="1.5" />
                                            <path d="M24 5 L23 12" stroke="#d4a574" strokeWidth="1.5" />
                                            <path d="M29 7 L26 13" stroke="#d4a574" strokeWidth="1.5" />
                                            <path d="M27 10 L25 15" stroke="#d4a574" strokeWidth="1.5" />
                                            {/* Thistle body cross-hatch */}
                                            <path d="M14 13 Q20 19 26 13" stroke="#b8956a" strokeWidth="0.6" fill="none" />
                                            <path d="M14 16 Q20 22 26 16" stroke="#b8956a" strokeWidth="0.6" fill="none" />
                                            <path d="M15 19 Q20 24 25 19" stroke="#b8956a" strokeWidth="0.6" fill="none" />
                                            {/* Collar/leaves */}
                                            <path d="M13 26 Q10 30 14 32 L18 27 Z" fill="#d4a574" />
                                            <path d="M27 26 Q30 30 26 32 L22 27 Z" fill="#d4a574" />
                                            {/* Stem */}
                                            <rect x="18" y="26" width="4" height="20" fill="#d4a574" />
                                            {/* Bottom handle/flourish */}
                                            <path d="M14 46 Q20 52 26 46" stroke="#d4a574" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right emblem - Crescent and Star */}
                        <div className="absolute right-4 sm:right-8 w-9 h-9 flex items-center justify-center">
                            <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
                                {/* Crescent moon */}
                                <path
                                    d="M22 6 A 14 14 0 1 0 22 34 A 11 11 0 1 1 22 6"
                                    fill="none"
                                    stroke="#9d5c5c"
                                    strokeWidth="1.2"
                                />
                                {/* Five-pointed star */}
                                <polygon
                                    points="32,10 33.5,15 38,15.5 34.5,18.5 35.5,23 32,20 28.5,23 29.5,18.5 26,15.5 30.5,15"
                                    fill="#9d5c5c"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Name section */}
                    <div className="relative text-center mt-6 sm:mt-8 mb-8 sm:mb-10">
                        <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl mb-3 sm:mb-4 tracking-wide italic text-[#8b2323]">
                            ALAIR
                        </h1>
                        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl tracking-[0.15em] sm:tracking-[0.2em] mb-0.5 font-normal text-[#1a1a1a]">
                            FERGUSON
                        </h2>
                        <h2 className="font-[family-name:var(--font-playfair)] text-xl sm:text-2xl tracking-[0.15em] sm:tracking-[0.2em] font-normal text-[#1a1a1a]">
                            HAUTZINGER
                        </h2>
                    </div>

                    {/* Links section */}
                    <nav className="relative flex flex-col items-center gap-1.5 sm:gap-2 mt-2 sm:mt-4 font-[family-name:var(--font-playfair)]">
                        <a
                            href="mailto:contact@example.com"
                            className="text-base sm:text-lg hover:underline italic text-[#1a1a1a]"
                        >
                            I. Email
                        </a>
                        <a
                            href="/resume"
                            className="text-base sm:text-lg hover:underline italic text-[#1a1a1a]"
                        >
                            II. Resume
                        </a>
                        <a
                            href="https://linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base sm:text-lg hover:underline italic text-[#1a1a1a]"
                        >
                            II. LinkedIn
                        </a>
                    </nav>
                </div>
            </div>
        </div>
    );
}
