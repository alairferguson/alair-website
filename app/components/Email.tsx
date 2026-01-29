"use client";

import { useState, useRef, useEffect } from "react";

export function Email() {
    const [hasCopied, setHasCopied] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const email = "alairferguson@gmail.com";

    const copyToClipboard = async () => {
        if (hasCopied) return;
        try {
            await navigator.clipboard.writeText(email);
            setHasCopied(true);
            // Clear any existing timeout
            if (timeoutRef.current !== null) {
                clearTimeout(timeoutRef.current);
            }
            // Set new timeout and store the ID
            timeoutRef.current = setTimeout(() => setHasCopied(false), 2500);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if Cmd+C (Mac) or Ctrl+C (Windows/Linux) is pressed while hovering
            if (isHovering && (e.metaKey || e.ctrlKey) && e.key === "c") {
                e.preventDefault();
                copyToClipboard();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isHovering]);

    return (
        <button
            data-debug
            title="Copy email"
            aria-label="Copy email"
            type="button"
            onClick={copyToClipboard}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`group 
                ${!hasCopied && "cursor-copy"}
            `}
        >
            <span
                className={`
                inline-block
                text-xl sm:text-base
                text-center
                text-[rgba(0,0,0,0.85)]
                mix-blend-multiply
                ${!hasCopied &&
                    `
                    group-hover:text-primary 
                    group-active:scale-95
                    transition-transform
                `
                    }
                select-text
            `}
            >
                {hasCopied ? (
                    <span>Copied email</span>
                ) : (
                    <>
                        <span className="group-hover:hidden">I. Email</span>
                        <span className="hidden group-hover:inline">
                            {email}
                        </span>
                    </>
                )}
            </span>
        </button>
    );
}
