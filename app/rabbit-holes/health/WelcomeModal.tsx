"use client";

import { useState } from "react";
import { sansHeading } from "./constants";

const EMAIL = "alairferguson@gmail.com";

const RULES = [
    "Read 10 pages of nonfiction a day",
    "Do two 45-minute workouts, one must be done outside",
    "Take a progress picture",
    "Drink one gallon of water",
    "Follow a diet of your choice (no alcohol)",
    "Perform all tasks for 75 consecutive days. Miss a task on any day and the challenge starts over.",
];

export default function WelcomeModal({ onClose }: { onClose: () => void }) {
    const [copied, setCopied] = useState(false);

    function flashCopied() {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    }

    async function handleCopyEmail() {
        try {
            await navigator.clipboard.writeText(EMAIL);
            flashCopied();
        } catch {
            // Fallback for browsers/contexts that block the async Clipboard API.
            const textarea = document.createElement("textarea");
            textarea.value = EMAIL;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy");
                flashCopied();
            } catch {
                // Copy isn't available in this context — nothing more we can do.
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            onClick={onClose}
        >
            <div
                className="max-h-[90vh] w-full max-w-sm overflow-y-auto border-2 border-black bg-[#eeeeee] p-4 sm:p-5 shadow-[6px_6px_0_0_#000]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2
                    id="welcome-modal-title"
                    className="text-[clamp(1.35rem,7vw,1.75rem)] font-black uppercase leading-none tracking-tighter text-black"
                    style={sansHeading}
                >
                    75 Hard Tracker Demo
                </h2>

                <p className="mt-3 text-[0.8rem] leading-relaxed text-black">
                    A few friends and I embarked on the 75 Hard challenge together, but found it difficult to keep
                    track of our progress. I made this website to track our progress and share our results.
                </p>
                <p className="mt-3 text-[0.8rem] leading-relaxed text-black">
                    If you&apos;re interested in using the site or have any feedback, email me{" "}
                    <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="underline underline-offset-2 decoration-2 hover:text-neutral-700"
                    >
                        {EMAIL}
                    </button>
                    {copied ? (
                        <span className="ml-1.5 text-[0.7rem] font-black uppercase tracking-wide text-neutral-500">
                            Copied!
                        </span>
                    ) : null}
                    .
                </p>

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-700">
                    75 Hard rules
                </p>
                <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-[0.8rem] leading-snug text-black">
                    {RULES.map((rule) => (
                        <li key={rule}>{rule}</li>
                    ))}
                </ol>

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-5 w-full block text-center rounded-none border-2 border-black bg-black py-2.5 font-black uppercase tracking-[0.14em] text-[0.6875rem] text-white shadow-none transition-colors hover:bg-neutral-900 active:bg-neutral-800"
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
