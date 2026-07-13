"use client";

import { useEffect, useState } from "react";
import ProgressPhotoPlaceholder from "./ProgressPhotoPlaceholder";
import { COMPLETED_DAYS } from "./constants";

const FLIP_MS = 380;

type Props = {
    upToDay: number;
    /** The visitor's own uploaded photo for day COMPLETED_DAYS, if any. */
    day20PhotoSrc?: string | null;
    onClose: () => void;
};

/** Auto-advancing reel of every completed day up to the one being viewed. */
export default function StreakReel({ upToDay, day20PhotoSrc, onClose }: Props) {
    const [index, setIndex] = useState(Math.max(upToDay - 1, 0));

    useEffect(() => {
        if (upToDay <= 1) return;
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % upToDay);
        }, FLIP_MS);
        return () => window.clearInterval(id);
    }, [upToDay]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    if (upToDay <= 0) return null;

    const day = index + 1;
    const showUploadedPhoto = day === COMPLETED_DAYS && day20PhotoSrc;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 border-2 border-black px-2 py-2 bg-neutral-100">
                <p className="text-[0.55rem] font-black uppercase tracking-[0.18em] text-black">
                    Streak reel
                    <span className="text-neutral-500 font-bold normal-case tracking-normal"> · {day}/{upToDay}</span>
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 border-2 border-black bg-white px-2 py-1 text-[0.5rem] font-black uppercase tracking-[0.14em] hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                    Close
                </button>
            </div>

            <div className="relative w-full overflow-hidden border-2 border-black bg-black aspect-square">
                {showUploadedPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- demo upload; never leaves the browser
                    <img src={day20PhotoSrc} alt="Your uploaded progress photo" className="block h-full w-full object-cover" />
                ) : (
                    <ProgressPhotoPlaceholder day={day} key={day} />
                )}
            </div>

            <p className="text-center text-[0.55rem] font-black uppercase tracking-[0.22em] text-neutral-500">
                Day {day} of streak
            </p>
        </div>
    );
}
