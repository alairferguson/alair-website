"use client";

import { useState } from "react";
import Link from "next/link";
import { sansHeading } from "./constants";

const fieldClass =
    "w-full rounded-none border-2 border-black bg-white px-3.5 py-2.5 text-[0.9375rem] font-semibold text-black cursor-default select-none focus:border-black focus:outline-none focus:ring-0";
const labelClass = "block text-[10px] font-black uppercase tracking-[0.18em] text-neutral-700";
const btnPrimaryClass =
    "w-full block text-center rounded-none border-2 border-black bg-black py-2.5 font-black uppercase tracking-[0.14em] text-[0.6875rem] text-white shadow-none transition-colors hover:bg-neutral-900 active:bg-neutral-800 disabled:opacity-45";

function BackChevron({ className }: { className?: string }) {
    return (
        <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
    );
}

/** Fake credentials, pre-filled and locked — nothing here is ever submitted anywhere. */
export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [signingIn, setSigningIn] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSigningIn(true);
        window.setTimeout(() => {
            setSigningIn(false);
            onLogin();
        }, 450);
    }

    const blockEdits = (e: React.KeyboardEvent) => e.preventDefault();

    return (
        <main className="min-h-dvh flex flex-col bg-white text-black">
            <div className="flex-1 w-full max-w-md mx-auto px-3 pt-4 pb-10">
                <div className="flex flex-col gap-6">
                    <div className="flex justify-center">
                        <Link
                            href="/#rabbit-holes"
                            aria-label="Back to Rabbit Holes"
                            className="shrink-0 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                            <div className="w-8 h-8 rounded-none border-2 border-black bg-white flex items-center justify-center text-black transition-colors hover:bg-neutral-200">
                                <BackChevron className="w-5 h-5 -translate-x-px" />
                            </div>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-neutral-500 mb-2" style={sansHeading}>
                            75 Hard
                        </p>
                        <h1
                            className="text-[clamp(1.75rem,8vw,2.35rem)] font-black uppercase leading-none tracking-tighter"
                            style={sansHeading}
                        >
                            Log in
                        </h1>
                        <p className="mt-2 text-[0.65rem] font-black uppercase tracking-[0.28em] text-neutral-600" style={sansHeading}>
                            Welcome back
                        </p>
                    </div>

                    <div className="border-2 border-black bg-[#eeeeee] p-4 sm:p-5">
                        <form onSubmit={handleSubmit} className="space-y-5" style={sansHeading}>
                            <div className="space-y-2">
                                <label htmlFor="demo-email" className={labelClass}>
                                    Email
                                </label>
                                <input
                                    id="demo-email"
                                    type="email"
                                    value="user@example.com"
                                    readOnly
                                    onKeyDown={blockEdits}
                                    className={fieldClass}
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="demo-password" className={labelClass}>
                                    Password
                                </label>
                                <input
                                    id="demo-password"
                                    type="password"
                                    value="letmein"
                                    readOnly
                                    onKeyDown={blockEdits}
                                    className={fieldClass}
                                />
                            </div>
                            <button type="submit" disabled={signingIn} className={`${btnPrimaryClass} mt-1`}>
                                {signingIn ? "Signing in…" : "Sign in"}
                            </button>
                        </form>
                    </div>

                    <p className="text-center text-[10px] font-black uppercase tracking-[0.14em] text-neutral-400" style={sansHeading}>
                        Demo mode
                    </p>
                </div>
            </div>
        </main>
    );
}
