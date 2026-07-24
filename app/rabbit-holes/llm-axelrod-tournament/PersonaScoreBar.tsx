"use client";

import { useMemo, useState } from "react";
import SeriesLegend from "./SeriesLegend";
import type { Player, Report } from "./types";

type Props = {
    report: Report;
    highlightedId: string | null;
    onHighlight: (id: string | null) => void;
};

const PERSONA_LABEL: Record<string, string> = {
    neutral: "Neutral",
    cooperative: "Cooperative",
    payoff_only: "Payoff-only",
    selfish: "Selfish",
};

const WIDTH = 640;
const HEIGHT = 380;
const MARGIN = { top: 30, right: 16, bottom: 44, left: 72 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

function formatVal(v: number): string {
    return v.toFixed(2);
}

function scale(domain: [number, number], range: [number, number]) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const span = d1 - d0 || 1;
    return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

function ticks(domain: [number, number], count = 4): number[] {
    const [min, max] = domain;
    if (max <= min) return [min];
    const step = (max - min) / count;
    return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

type PersonaStat = {
    id: string;
    label: string;
    players: Player[];
    mean: number;
};

export default function PersonaScoreBar({
    report,
    highlightedId,
    onHighlight,
}: Props) {
    const [hoverPersona, setHoverPersona] = useState<string | null>(null);

    const byId = useMemo(
        () => new Map(report.players.map((p) => [p.id, p])),
        [report.players],
    );

    const personaStats = useMemo(() => {
        const stats = Object.entries(PERSONA_LABEL).map(([id, label]) => {
            const players = report.players.filter(
                (p) => p.kind === "llm" && p.persona === id,
            );
            const values = players.map((p) => p.outcomes.meanScorePerTurn);
            const mean = values.length
                ? values.reduce((a, b) => a + b, 0) / values.length
                : 0;
            return { id, label, players, mean };
        });
        return stats.sort((a, b) => b.mean - a.mean);
    }, [report.players]);

    const domain = useMemo<[number, number]>(() => {
        const values = personaStats.flatMap((s) =>
            s.players.map((p) => p.outcomes.meanScorePerTurn),
        );
        const max = values.length ? Math.max(...values) : 1;
        return [0, max * 1.12];
    }, [personaStats]);

    const yOf = useMemo(() => scale(domain, [INNER_H, 0]), [domain]);
    const yTicks = ticks(domain, 4);

    const laneW = INNER_W / personaStats.length;
    const barW = Math.min(56, laneW * 0.55);

    const activePlayer = highlightedId ? byId.get(highlightedId) ?? null : null;

    function clearHover() {
        setHoverPersona(null);
        onHighlight(null);
    }

    return (
        <div className="ipd-chart-shell ipd-score-shell">
            <div className="ipd-chart-toolbar">
                <div className="ipd-toolbar-custom">
                    <SeriesLegend
                        series={report.series}
                        onHighlight={onHighlight}
                    />
                </div>
            </div>

            <div className="ipd-chart ipd-score-chart" onMouseLeave={clearHover}>
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    role="img"
                    aria-label="Mean score per turn by persona"
                >
                    <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                        {yTicks.map((t) => (
                            <line
                                key={`g-${t}`}
                                className="ipd-gridline"
                                x1={0}
                                x2={INNER_W}
                                y1={yOf(t)}
                                y2={yOf(t)}
                            />
                        ))}

                        {personaStats.map((persona: PersonaStat, i) => {
                            const cx = laneW * i + laneW / 2;
                            const barTop = yOf(persona.mean);
                            /** Topmost point in this lane (bar or any model
                             * dot) so the value label always clears every
                             * dot instead of just the bar top. */
                            const topY = Math.min(
                                barTop,
                                ...persona.players.map((p) =>
                                    yOf(p.outcomes.meanScorePerTurn),
                                ),
                            );
                            const laneActive = hoverPersona === persona.id;
                            const dimmed =
                                hoverPersona != null &&
                                hoverPersona !== persona.id;

                            return (
                                <g
                                    key={persona.id}
                                    onMouseEnter={() =>
                                        setHoverPersona(persona.id)
                                    }
                                >
                                    <rect
                                        className="ipd-slope-lane"
                                        data-active={laneActive}
                                        x={cx - laneW / 2}
                                        y={0}
                                        width={laneW}
                                        height={INNER_H}
                                    />
                                    <rect
                                        className="ipd-score-bar"
                                        data-dimmed={dimmed}
                                        x={cx - barW / 2}
                                        y={barTop}
                                        width={barW}
                                        height={Math.max(INNER_H - barTop, 0)}
                                    />
                                    {persona.players.map((player) => {
                                        const isActive =
                                            activePlayer?.id === player.id;
                                        const sameModel =
                                            activePlayer != null &&
                                            activePlayer.kind === "llm" &&
                                            activePlayer.model ===
                                                player.model;
                                        const ptDimmed =
                                            (hoverPersona != null &&
                                                hoverPersona !==
                                                    persona.id) ||
                                            (activePlayer != null &&
                                                !(isActive || sameModel));
                                        return (
                                            <g
                                                key={player.id}
                                                transform={`translate(${cx}, ${yOf(
                                                    player.outcomes
                                                        .meanScorePerTurn,
                                                )})`}
                                                onMouseEnter={() => {
                                                    setHoverPersona(
                                                        persona.id,
                                                    );
                                                    onHighlight(player.id);
                                                }}
                                            >
                                                <circle
                                                    r={12}
                                                    fill="transparent"
                                                    className="ipd-point-hit"
                                                />
                                                <circle
                                                    className="ipd-slope-marker"
                                                    r={isActive ? 7.5 : 6}
                                                    fill={player.color}
                                                    stroke="#fff"
                                                    strokeWidth={1.4}
                                                    data-dimmed={ptDimmed}
                                                    tabIndex={0}
                                                    role="button"
                                                    aria-label={`${player.label}: ${formatVal(
                                                        player.outcomes
                                                            .meanScorePerTurn,
                                                    )}`}
                                                />
                                            </g>
                                        );
                                    })}

                                    <text
                                        className="ipd-score-bar-value ipd-mono"
                                        data-dimmed={dimmed}
                                        x={cx}
                                        y={topY - 14}
                                        textAnchor="middle"
                                    >
                                        {formatVal(persona.mean)}
                                    </text>

                                    <text
                                        className="ipd-score-xtick ipd-mono"
                                        data-active={laneActive}
                                        x={cx}
                                        y={INNER_H + 22}
                                        textAnchor="middle"
                                    >
                                        {persona.label}
                                    </text>
                                </g>
                            );
                        })}

                        {yTicks.map((t) => (
                            <text
                                key={`yl-${t}`}
                                className="ipd-axis-tick ipd-mono"
                                x={-10}
                                y={yOf(t)}
                                textAnchor="end"
                                dominantBaseline="middle"
                            >
                                {formatVal(t)}
                            </text>
                        ))}

                        <text
                            className="ipd-axis-title"
                            transform={`translate(-52, ${
                                INNER_H / 2
                            }) rotate(-90)`}
                            textAnchor="middle"
                        >
                            Mean score / turn
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
}
