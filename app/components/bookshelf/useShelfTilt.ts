"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";

const MAX_TILT_DEG = 2;
const PERSPECTIVE_PX = 1400;
const SMOOTHING = 0.05;

/** Flip to true to restore scroll-linked perspective tilt. */
const SHELF_TILT_ENABLED = false;

export const SHELF_TILT_STYLE: CSSProperties = SHELF_TILT_ENABLED
    ? {
          transformOrigin: "50% 100%",
          transform: `perspective(${PERSPECTIVE_PX}px) rotateX(0deg)`,
          willChange: "transform",
      }
    : {};

/**
 * Scroll-linked CSS perspective tilt. Currently paused (SHELF_TILT_ENABLED).
 */
export function useShelfTilt(): RefObject<HTMLDivElement | null> {
    const ref = useRef<HTMLDivElement | null>(null);
    const currentTilt = useRef(0);
    const targetTilt = useRef(0);
    const rafId = useRef(0);
    const looping = useRef(false);

    useEffect(() => {
        if (!SHELF_TILT_ENABLED) return;

        const el = ref.current;
        if (!el) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (reduceMotion.matches) return;

        const tick = () => {
            if (!looping.current || !ref.current) return;

            const rect = ref.current.getBoundingClientRect();
            const viewportCenter = window.innerHeight / 2;
            const rectCenter = rect.top + rect.height / 2;
            const denom = window.innerHeight / 2 + rect.height / 2;
            const progress =
                denom === 0 ? 0 : Math.max(-1, Math.min(1, (rectCenter - viewportCenter) / denom));
            targetTilt.current = progress * MAX_TILT_DEG;

            currentTilt.current += (targetTilt.current - currentTilt.current) * SMOOTHING;
            ref.current.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${currentTilt.current.toFixed(3)}deg)`;

            rafId.current = requestAnimationFrame(tick);
        };

        const start = () => {
            if (looping.current) return;
            looping.current = true;
            rafId.current = requestAnimationFrame(tick);
        };

        const stop = () => {
            looping.current = false;
            cancelAnimationFrame(rafId.current);
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) start();
                else stop();
            },
            { rootMargin: "100% 0px" }
        );

        observer.observe(el);
        return () => {
            stop();
            observer.disconnect();
        };
    }, []);

    return ref;
}
