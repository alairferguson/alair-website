"use client";

import { useState } from "react";
import {
    COMPLETED_DAYS,
    getHoneycombCells,
    getViewBox,
    hexagonPoints,
    hexSize,
    honeycombDayLabelFontSize,
    honeycombEmptyFill,
    honeycombLabelOnEmpty,
    honeycombLabelOnFilled,
    HABIT_ORDER,
    HABIT_HEX_CLIP_PATH,
    HABIT_RAINBOW_CONIC,
    type HabitTaskKey,
} from "./constants";

type HoneycombProps = {
    viewDay: number;
    onSelectDay: (day: number) => void;
    /** Whether day COMPLETED_DAYS (the only togglable day) is currently fully checked off. */
    isDay20Complete: boolean;
    /** Day 0 is the "nothing done yet" preview — every cell shows empty. */
    isDay0: boolean;
};

/** 75-cell honeycomb — days 1..19 are always filled, day COMPLETED_DAYS reflects live toggles, the rest are empty. */
export function HabitHoneycomb({ viewDay, onSelectDay, isDay20Complete, isDay0 }: HoneycombProps) {
    const cells = getHoneycombCells();
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);

    return (
        <svg viewBox={getViewBox()} className="block w-full h-auto max-w-none font-sans" style={{ overflow: "visible" }}>
            {cells.map(({ day, cx, cy }) => {
                const filled = isDay0 ? false : day < COMPLETED_DAYS ? true : day === COMPLETED_DAYS ? isDay20Complete : false;
                const navigable = day >= 1 && day <= COMPLETED_DAYS;
                const isViewed = day === viewDay;
                const labelFill = filled ? honeycombLabelOnFilled : honeycombLabelOnEmpty;
                const isRaised = navigable && (hoveredDay === day || isViewed);
                return (
                    <g key={day}>
                        <g
                            style={{
                                transition: "transform 0.22s cubic-bezier(0.34, 1.45, 0.64, 1), filter 0.2s ease-out",
                                transform: isRaised ? "translateY(-3px)" : "translateY(0)",
                                filter: isRaised ? "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.32))" : "none",
                            }}
                        >
                            <polygon
                                points={hexagonPoints(cx, cy, hexSize - 0.5)}
                                fill={filled ? "#000000" : honeycombEmptyFill}
                                stroke={isViewed ? "#910A07" : "none"}
                                strokeWidth={isViewed ? 2 : 0}
                                style={{ cursor: navigable ? "pointer" : undefined }}
                                onMouseEnter={() => navigable && setHoveredDay(day)}
                                onMouseLeave={() => setHoveredDay((d) => (d === day ? null : d))}
                                onMouseDown={navigable ? (e) => e.preventDefault() : undefined}
                                onClick={navigable ? () => onSelectDay(day) : undefined}
                                role={navigable ? "button" : undefined}
                                tabIndex={navigable ? 0 : undefined}
                                onKeyDown={
                                    navigable
                                        ? (e) => {
                                              if (e.key === "Enter" || e.key === " ") {
                                                  e.preventDefault();
                                                  onSelectDay(day);
                                              }
                                          }
                                        : undefined
                                }
                                aria-label={navigable ? `View day ${day} of the challenge` : undefined}
                            />
                            <text
                                x={cx}
                                y={cy}
                                textAnchor="middle"
                                dominantBaseline="central"
                                fill={labelFill}
                                fontSize={honeycombDayLabelFontSize}
                                fontWeight={700}
                                className="pointer-events-none select-none"
                            >
                                {day}
                            </text>
                        </g>
                    </g>
                );
            })}
        </svg>
    );
}

const R = 50;
const VB_W = 2 * R;
const VB_H = R * Math.sqrt(3);
const CX = R;
const CY = VB_H / 2;
const HEX_ASPECT = VB_W / VB_H;

/** Round to kill sub-pixel float epsilon that differs between server/client trig, which
 * otherwise trips a React hydration mismatch on the `d` attribute string. */
function r4(n: number): number {
    return Math.round(n * 10000) / 10000;
}

function wedgePath(k: number): string {
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const t0 = rad(120 - k * 60);
    const t1 = rad(120 - (k + 1) * 60);
    const x0 = r4(CX + R * Math.cos(t0));
    const y0 = r4(CY - R * Math.sin(t0));
    const x1 = r4(CX + R * Math.cos(t1));
    const y1 = r4(CY - R * Math.sin(t1));
    return `M ${CX} ${CY} L ${x0} ${y0} L ${x1} ${y1} Z`;
}

/** Rainbow hex wheel behind the day header — wedges reflect the viewed day's task completion. */
export function HabitProgressHex({
    completion,
    className = "",
}: {
    completion: Record<HabitTaskKey, boolean>;
    className?: string;
}) {
    return (
        <div className={`relative z-0 w-full max-w-full ${className}`} style={{ aspectRatio: `${HEX_ASPECT}` }}>
            <div
                className="absolute inset-0"
                style={{ clipPath: HABIT_HEX_CLIP_PATH, background: HABIT_RAINBOW_CONIC }}
                aria-hidden
            />
            <svg
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="xMidYMid meet"
                aria-hidden
                focusable="false"
            >
                <g className="pointer-events-none">
                    {HABIT_ORDER.map((key, k) => (
                        <path key={key} d={wedgePath(k)} fill="#f8f8f8" fillOpacity={completion[key] ? 0 : 0.72} />
                    ))}
                </g>
            </svg>
        </div>
    );
}
