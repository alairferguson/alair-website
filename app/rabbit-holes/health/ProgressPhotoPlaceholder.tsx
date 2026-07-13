import { hueForDay } from "./data";

/** Stand-in for a real progress photo — the actual app stores a user-uploaded image here. */
export default function ProgressPhotoPlaceholder({
    day,
    className = "",
}: {
    day: number;
    className?: string;
}) {
    const hue = hueForDay(day);
    return (
        <div
            className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
            style={{
                background: `linear-gradient(135deg, hsl(${hue} 70% 62%), hsl(${(hue + 45) % 360} 65% 40%))`,
            }}
        >
            <svg width="34%" height="34%" viewBox="0 0 24 24" fill="none" className="opacity-80">
                <path
                    d="M12 3c-1.5 0-2.6 1.2-2.6 2.6 0 .8.3 1.5.9 2C9 8.4 8 9.9 8 11.6V21h8v-9.4c0-1.7-1-3.2-2.3-4C14.3 7.1 14.6 6.4 14.6 5.6 14.6 4.2 13.5 3 12 3z"
                    fill="white"
                />
            </svg>
            <span className="absolute bottom-1.5 left-1.5 text-[0.5rem] font-black uppercase tracking-[0.18em] text-white/90 drop-shadow">
                Day {day}
            </span>
        </div>
    );
}
