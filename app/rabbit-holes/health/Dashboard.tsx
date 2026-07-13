"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { HabitHoneycomb, HabitProgressHex } from "./Honeycomb";
import ProgressPhotoPlaceholder from "./ProgressPhotoPlaceholder";
import StreakReel from "./StreakReel";
import { getDemoNotes } from "./data";
import { COMPLETED_DAYS, MIN_DAY, HABIT_HEX, HABIT_ORDER, sansHeading, type HabitTaskKey } from "./constants";

type Day20Tasks = Record<Exclude<HabitTaskKey, "progressPhoto">, boolean>;

const DAY20_DEFAULT: Day20Tasks = {
    read: true,
    workout1: true,
    workout2: true,
    diet: true,
    water: true,
};

type TaskCard = {
    key: HabitTaskKey;
    label: string;
    note?: string;
};

function ChevronLeft({ className }: { className?: string }) {
    return (
        <svg className={className} width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
    );
}

function ChevronRight({ className }: { className?: string }) {
    return (
        <svg className={className} width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M10 6l6 6-6 6" stroke="currentColor" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
    );
}

function PhotoShuffleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <g transform="translate(2.75 1)">
                <rect x="2" y="8" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.75" />
                <rect x="6.5" y="4" width="10" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.75" />
            </g>
        </svg>
    );
}

function CameraIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="32" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M4 9h3l1.5-2h7L17 9h3v9H4V9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
            <path d="M9 12h6v5H9v-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
        </svg>
    );
}

function TaskBox({ checked }: { checked: boolean }) {
    return (
        <div
            className={`mt-0.5 flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center border-2 border-black ${checked ? "bg-black" : "bg-white"}`}
        >
            {checked ? (
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3.8 8.3L7 11.5l5.5-6.8" stroke="#fff" strokeWidth="2.25" strokeLinecap="square" strokeLinejoin="miter" />
                </svg>
            ) : null}
        </div>
    );
}

function Avatar({ onLogout }: { onLogout: () => void }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label="Account"
                aria-expanded={open}
                className="w-8 h-8 rounded-none border-2 border-black bg-white flex items-center justify-center overflow-hidden transition-colors hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
                <span className="text-gray-700 text-xs font-semibold">U</span>
            </button>
            {open ? (
                <div className="absolute right-0 top-10 z-30 w-32 border-2 border-black bg-white shadow-[3px_3px_0_0_#000]">
                    <button
                        type="button"
                        onClick={onLogout}
                        className="block w-full px-3 py-2 text-left text-[0.6875rem] font-black uppercase tracking-[0.1em] text-black hover:bg-neutral-100"
                    >
                        Log out
                    </button>
                </div>
            ) : null}
        </div>
    );
}

export default function Dashboard({
    viewDay,
    onSelectDay,
    onLogout,
}: {
    viewDay: number;
    onSelectDay: (day: number) => void;
    onLogout: () => void;
}) {
    const [reelOpen, setReelOpen] = useState(false);
    const [day20Tasks, setDay20Tasks] = useState<Day20Tasks>(DAY20_DEFAULT);
    const [day20PhotoSrc, setDay20PhotoSrc] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const isDay20 = viewDay === COMPLETED_DAYS;
    const isDay0 = viewDay === MIN_DAY;
    const isEditable = isDay20;
    const isDay20Complete = Object.values(day20Tasks).every(Boolean);
    const canGoPrev = viewDay > MIN_DAY;
    const canGoNext = viewDay < COMPLETED_DAYS;

    function isChecked(key: HabitTaskKey): boolean {
        if (isDay0) return false;
        if (viewDay < COMPLETED_DAYS) return true;
        if (key === "progressPhoto") return true;
        return day20Tasks[key];
    }

    function handleCardClick(key: HabitTaskKey) {
        if (!isEditable) return;
        if (key === "progressPhoto") {
            photoInputRef.current?.click();
            return;
        }
        setDay20Tasks((t) => ({ ...t, [key]: !t[key] }));
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") setDay20PhotoSrc(reader.result);
        };
        reader.readAsDataURL(file);
    }

    const notes = viewDay >= 1 ? getDemoNotes(Math.min(viewDay, COMPLETED_DAYS)) : null;

    const taskCards: TaskCard[] = [
        { key: "read", label: "READ", note: notes?.readNote },
        { key: "workout1", label: "WORKOUT #1", note: notes?.workout1Note },
        { key: "workout2", label: "WORKOUT #2", note: notes?.workout2Note },
        { key: "progressPhoto", label: "PHOTO" },
        { key: "water", label: "WATER" },
        { key: "diet", label: "DIET", note: notes?.dietNote },
    ];

    const completion: Record<HabitTaskKey, boolean> = Object.fromEntries(
        HABIT_ORDER.map((key) => [key, isChecked(key)]),
    ) as Record<HabitTaskKey, boolean>;

    const footerCaption = isDay0 ? "Not started" : isDay20 ? "Today" : "Completed";

    return (
        <main className="min-h-dvh flex flex-col bg-white text-black">
            <div className="flex-1 w-full max-w-md mx-auto px-3 pt-4 pb-8">
                <div className="flex flex-col gap-4">
                    <div className="relative flex flex-col items-center gap-3">
                        <div className="relative z-10 flex w-full items-center justify-between pt-0.5">
                            <Link
                                href="/#rabbit-holes"
                                aria-label="Back to Rabbit Holes"
                                className="text-[10px] font-black uppercase tracking-[0.14em] text-neutral-500 hover:text-black transition-colors"
                            >
                                ← Rabbit Holes
                            </Link>
                            <Avatar onLogout={onLogout} />
                        </div>

                        <div className="relative isolate z-0 flex w-full items-center justify-between gap-1 pb-2">
                            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center" aria-hidden>
                                <div className="w-52 max-w-full">
                                    <HabitProgressHex completion={completion} className="block w-full h-auto opacity-[0.88]" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => canGoPrev && onSelectDay(viewDay - 1)}
                                disabled={!canGoPrev}
                                className={`relative z-10 shrink-0 flex h-11 w-11 items-center justify-center bg-transparent transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                                    canGoPrev ? "text-black hover:opacity-70" : "cursor-not-allowed text-neutral-300 opacity-45"
                                }`}
                                aria-label="Previous day"
                            >
                                <ChevronLeft />
                            </button>
                            <div className="relative z-10 min-h-0 min-w-0 flex-1 self-stretch">
                                <div className="flex h-full min-h-[2.75rem] flex-col items-center justify-center text-center">
                                    <h1
                                        className="text-[clamp(1.75rem,8vw,2.35rem)] font-black uppercase leading-none tracking-tighter"
                                        style={sansHeading}
                                    >
                                        Day {viewDay}
                                    </h1>
                                    <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.28em]">Of 75 hard</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => canGoNext && onSelectDay(viewDay + 1)}
                                disabled={!canGoNext}
                                className={`relative z-10 shrink-0 flex h-11 w-11 items-center justify-center bg-transparent transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                                    canGoNext ? "text-black hover:opacity-70" : "cursor-not-allowed text-neutral-300 opacity-45"
                                }`}
                                aria-label="Next day"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-col gap-4">
                        {reelOpen ? (
                            <StreakReel
                                key={viewDay}
                                upToDay={Math.max(viewDay, 0)}
                                day20PhotoSrc={day20PhotoSrc}
                                onClose={() => setReelOpen(false)}
                            />
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-px bg-black border-2 border-black">
                                    {taskCards.map(({ key, label, note }) => {
                                        const checked = isChecked(key);
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => handleCardClick(key)}
                                                className={`relative flex flex-col p-2 min-h-[120px] ${
                                                    isEditable
                                                        ? "cursor-pointer hover:z-10 hover:-translate-y-[3px] hover:drop-shadow-[0_6px_10px_rgba(0,0,0,0.32)]"
                                                        : "cursor-default"
                                                }`}
                                                style={{
                                                    backgroundColor: checked ? HABIT_HEX[key] : "#eeeeee",
                                                    transition: "transform 0.22s cubic-bezier(0.34, 1.45, 0.64, 1), filter 0.2s ease-out, background-color 0.2s ease",
                                                }}
                                            >
                                                <div className="flex justify-end">
                                                    <TaskBox checked={checked} />
                                                </div>
                                                <div className="flex-1 flex items-center justify-center px-0.5 py-2">
                                                    <span className="text-center text-[0.62rem] font-black leading-tight tracking-wide text-black uppercase">
                                                        {label}
                                                    </span>
                                                </div>
                                                {checked && note ? (
                                                    <div className="mt-auto flex w-full justify-start self-stretch pt-0.5">
                                                        <p className="w-full text-left text-[0.5rem] font-bold uppercase leading-tight tracking-wide text-black/70">
                                                            {note}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="mt-auto min-h-[0.85rem]" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="relative w-full">
                                    {!isDay0 ? (
                                        <button
                                            type="button"
                                            onClick={() => setReelOpen(true)}
                                            className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0_0_#000] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                                            aria-label="Play streak photo reel"
                                            title="Streak photo reel"
                                        >
                                            <PhotoShuffleIcon className="text-black" />
                                        </button>
                                    ) : null}

                                    {isDay0 ? (
                                        <div className="flex min-h-[5.75rem] w-full flex-col items-center justify-center border-2 border-dashed border-black bg-[#eeeeee]">
                                            <CameraIcon className="text-black mb-1" />
                                            <span className="text-[0.5rem] font-black tracking-[0.22em] text-black uppercase">No photo yet</span>
                                        </div>
                                    ) : isDay20 ? (
                                        <label className="relative block w-full cursor-pointer border-2 border-black aspect-square overflow-hidden bg-neutral-100 hover:bg-neutral-200/90 transition-colors">
                                            <input
                                                ref={photoInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="sr-only"
                                                onChange={handlePhotoChange}
                                            />
                                            {day20PhotoSrc ? (
                                                // eslint-disable-next-line @next/next/no-img-element -- demo upload; never leaves the browser
                                                <img src={day20PhotoSrc} alt="Your uploaded progress photo" className="block h-full w-full object-cover" />
                                            ) : (
                                                <ProgressPhotoPlaceholder day={viewDay} />
                                            )}
                                            <span className="pointer-events-none absolute bottom-1.5 right-1.5 border border-black/20 bg-white/85 px-1.5 py-0.5 text-[0.45rem] font-black uppercase tracking-[0.14em] text-black">
                                                Tap to change
                                            </span>
                                        </label>
                                    ) : (
                                        <div className="block w-full border-2 border-black aspect-square">
                                            <ProgressPhotoPlaceholder day={viewDay} />
                                        </div>
                                    )}
                                </div>

                                <HabitHoneycomb
                                    viewDay={viewDay}
                                    onSelectDay={onSelectDay}
                                    isDay20Complete={isDay20Complete}
                                    isDay0={isDay0}
                                />

                                <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">{footerCaption}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
