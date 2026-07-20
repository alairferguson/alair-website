"use client";

import { useEffect, useMemo, useState } from "react";
import SeriesLegend from "./SeriesLegend";
import type { MetricId, Player, Report, Series } from "./types";

type Props = {
    report: Report;
    highlightedId: string | null;
    onHighlight: (id: string | null) => void;
};

type PersonaMeta = {
    id: string;
    label: string;
};

const PERSONA_META: PersonaMeta[] = [
    { id: "cooperative", label: "cooperative" },
    { id: "neutral", label: "neutral" },
    { id: "payoff_only", label: "payoff-only" },
    { id: "selfish", label: "selfish" },
];

const PERSONA_ORDER = PERSONA_META.map((p) => p.id);

const WIDTH = 960;
const HEIGHT = 460;
const MARGIN = { top: 40, right: 20, bottom: 58, left: 54 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const FINGERPRINT_METRICS: MetricId[] = [
    "cooperation_rate",
    "niceness",
    "retaliation",
    "forgiveness",
    "provocability",
];

function metricValue(player: Player, id: MetricId): number {
    if (id === "mean_score_per_turn") return player.outcomes.meanScorePerTurn;
    return player.fingerprint[id];
}

function niceDomain(values: number[]): [number, number] {
    if (!values.length) return [0, 1];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min >= 0 && max <= 1) return [0, 1];
    if (min === max) return [min - 0.05, max + 0.05];
    const pad = (max - min) * 0.1;
    return [Math.max(0, min - pad), max + pad];
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

function formatVal(v: number): string {
    if (Math.abs(v) >= 10) return v.toFixed(1);
    return v.toFixed(2);
}

function diamondPath(size = 7): string {
    return `M0,${-size} L${size},0 L0,${size} L${-size},0 Z`;
}

type ModelCurve = {
    series: Series;
    points: Array<{
        persona: string;
        player: Player;
        value: number;
        x: number;
        y: number;
    }>;
    path: string;
};

export default function PersonaSlope({
    report,
    highlightedId,
    onHighlight,
}: Props) {
    const [metric, setMetric] = useState<MetricId>("cooperation_rate");
    const [hoverPersona, setHoverPersona] = useState<string | null>(null);
    const [focusPersona, setFocusPersona] = useState<string | null>(null);
    const [hoverPlayerId, setHoverPlayerId] = useState<string | null>(null);

    useEffect(() => {
        function onFigureAction(event: Event) {
            const { target, action } = (
                event as CustomEvent<{ target: string; action: string }>
            ).detail;
            if (target !== "persona-slope") return;
            if (FINGERPRINT_METRICS.includes(action as MetricId)) {
                setMetric(action as MetricId);
            }
        }

        window.addEventListener("ipd:figure-action", onFigureAction);
        return () => {
            window.removeEventListener("ipd:figure-action", onFigureAction);
        };
    }, []);

    const metricMeta = report.metrics.find((m) => m.id === metric)!;
    const activePersona = focusPersona ?? hoverPersona;

    const curves = useMemo(() => {
        const byId = new Map(report.players.map((p) => [p.id, p]));
        return report.series
            .map((series) => {
                const points = PERSONA_ORDER.map((persona) => {
                    const player = series.playerIds
                        .map((id) => byId.get(id))
                        .find((p) => p?.persona === persona);
                    if (!player) return null;
                    return {
                        persona,
                        player,
                        value: metricValue(player, metric),
                    };
                }).filter(Boolean) as Array<{
                    persona: string;
                    player: Player;
                    value: number;
                }>;
                if (points.length < 2) return null;
                return {
                    series,
                    raw: points,
                };
            })
            .filter(Boolean) as Array<{
            series: Series;
            raw: Array<{ persona: string; player: Player; value: number }>;
        }>;
    }, [report.series, report.players, metric]);

    const allValues = useMemo(
        () => curves.flatMap((c) => c.raw.map((p) => p.value)),
        [curves],
    );

    const domain = useMemo<[number, number]>(() => {
        if (metricMeta.domain !== "auto") return metricMeta.domain;
        return niceDomain(allValues);
    }, [metricMeta, allValues]);

    const yTicks = ticks(domain, 4);
    const yOf = useMemo(() => scale(domain, [INNER_H, 0]), [domain]);

    const laidOut = useMemo(() => {
        const panelW = INNER_W;
        // Inset endpoints so edge labels ("cooperative", "selfish") don't clip.
        const xPad = Math.min(28, panelW * 0.08);
        const xOf = (i: number) =>
            xPad +
            (i / Math.max(PERSONA_ORDER.length - 1, 1)) * (panelW - 2 * xPad);

        const modelCurves: ModelCurve[] = curves.map((curve) => {
            const points = curve.raw.map((pt) => ({
                ...pt,
                x: xOf(PERSONA_ORDER.indexOf(pt.persona)),
                y: yOf(pt.value),
            }));
            const path = points
                .map(
                    (p, i) =>
                        `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`,
                )
                .join(" ");
            return {
                series: curve.series,
                points,
                path,
            };
        });

        return {
            panelW,
            xOf,
            modelCurves,
        };
    }, [curves, yOf]);

    const activePlayerId = hoverPlayerId ?? highlightedId;
    const activePlayer = activePlayerId
        ? report.players.find((p) => p.id === activePlayerId) ?? null
        : null;

    function clearHover() {
        setHoverPersona(null);
        setHoverPlayerId(null);
        onHighlight(null);
    }

    function togglePersona(id: string) {
        setFocusPersona((prev) => (prev === id ? null : id));
    }

    if (!curves.length) return null;

    return (
        <div className="ipd-chart-shell ipd-slope-shell">
            <div className="ipd-chart-toolbar">
                <div className="ipd-toolbar-primary">
                    <div className="ipd-axis-group">
                        <span className="ipd-axis-label ipd-mono">Metric</span>
                        <div
                            className="ipd-toggle"
                            role="group"
                            aria-label="Slope metric"
                        >
                            {report.metrics
                                .filter((m) =>
                                    FINGERPRINT_METRICS.includes(m.id),
                                )
                                .map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        data-active={m.id === metric}
                                        onClick={() => setMetric(m.id)}
                                    >
                                        {m.shortLabel}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
                <div className="ipd-toolbar-custom">
                    <SeriesLegend
                        series={report.series}
                        onHighlight={onHighlight}
                    />
                </div>
            </div>

            <div
                className="ipd-chart ipd-slope-chart"
                onMouseLeave={clearHover}
            >
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    role="img"
                    aria-label={`${metricMeta.label} across personas`}
                >
                    <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                        {yTicks.map((tick) => (
                            <line
                                key={`yg-${tick}`}
                                className="ipd-gridline"
                                x1={0}
                                x2={INNER_W}
                                y1={yOf(tick)}
                                y2={yOf(tick)}
                            />
                        ))}

                        {PERSONA_ORDER.map((persona, i) => {
                            const x = laidOut.xOf(i);
                            const active =
                                activePersona == null ||
                                activePersona === persona;
                            const laneW =
                                laidOut.panelW / PERSONA_ORDER.length;
                            return (
                                <g key={persona}>
                                    <rect
                                        className="ipd-slope-lane"
                                        data-active={
                                            activePersona === persona
                                        }
                                        x={x - laneW / 2}
                                        y={0}
                                        width={laneW}
                                        height={INNER_H}
                                        onMouseEnter={() =>
                                            setHoverPersona(persona)
                                        }
                                        onClick={() => togglePersona(persona)}
                                    />
                                    <line
                                        className="ipd-slope-guide"
                                        data-active={
                                            activePersona === persona
                                        }
                                        data-dimmed={!active}
                                        x1={x}
                                        x2={x}
                                        y1={0}
                                        y2={INNER_H}
                                    />
                                </g>
                            );
                        })}

                        {laidOut.modelCurves.map((curve) => {
                            const seriesDimmed =
                                activePlayer != null &&
                                activePlayer.kind === "llm" &&
                                activePlayer.model !== curve.series.id;
                            return (
                                <path
                                    key={`${curve.series.id}-line`}
                                    className="ipd-slope-line"
                                    d={curve.path}
                                    stroke={curve.series.color}
                                    data-dimmed={seriesDimmed}
                                />
                            );
                        })}

                        {laidOut.modelCurves.flatMap((curve) =>
                            curve.points.map((pt) => {
                                const isActive =
                                    activePlayerId === pt.player.id ||
                                    activePersona === pt.persona;
                                const sameModel =
                                    activePlayer != null &&
                                    activePlayer.kind === "llm" &&
                                    activePlayer.model === pt.player.model;
                                const dimmed =
                                    (activePlayerId != null ||
                                        activePersona != null) &&
                                    !(
                                        activePlayerId === pt.player.id ||
                                        activePersona === pt.persona ||
                                        sameModel
                                    );
                                return (
                                    <g
                                        key={pt.player.id}
                                        className="ipd-point-group"
                                        transform={`translate(${pt.x}, ${pt.y})`}
                                        onMouseEnter={() => {
                                            setHoverPersona(pt.persona);
                                            setHoverPlayerId(pt.player.id);
                                            onHighlight(pt.player.id);
                                        }}
                                        onMouseLeave={() => {
                                            setHoverPlayerId(null);
                                        }}
                                        onClick={() => {
                                            onHighlight(pt.player.id);
                                            togglePersona(pt.persona);
                                        }}
                                    >
                                        <circle
                                            r={14}
                                            fill="transparent"
                                            className="ipd-point-hit"
                                        />
                                        <path
                                            className="ipd-slope-marker"
                                            d={diamondPath(
                                                isActive ? 8 : 6.5,
                                            )}
                                            fill={curve.series.color}
                                            stroke="#fff"
                                            strokeWidth={1.5}
                                            data-dimmed={dimmed}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`${pt.player.label}: ${formatVal(pt.value)}`}
                                        />
                                    </g>
                                );
                            }),
                        )}

                        {PERSONA_ORDER.map((persona, i) => {
                            const meta = PERSONA_META.find(
                                (p) => p.id === persona,
                            )!;
                            return (
                                <text
                                    key={`xl-${persona}`}
                                    className="ipd-axis-tick ipd-mono ipd-slope-xtick"
                                    data-active={activePersona === persona}
                                    x={laidOut.xOf(i)}
                                    y={INNER_H + 20}
                                    textAnchor="middle"
                                    onClick={() => togglePersona(persona)}
                                    onMouseEnter={() =>
                                        setHoverPersona(persona)
                                    }
                                >
                                    {meta.label}
                                </text>
                            );
                        })}

                        {yTicks.map((tick) => (
                            <text
                                key={`yl-${tick}`}
                                className="ipd-axis-tick ipd-mono"
                                x={-10}
                                y={yOf(tick)}
                                textAnchor="end"
                                dominantBaseline="middle"
                            >
                                {formatVal(tick)}
                            </text>
                        ))}

                        <text
                            className="ipd-axis-title"
                            transform={`translate(-42, ${INNER_H / 2}) rotate(-90)`}
                            textAnchor="middle"
                        >
                            {metricMeta.label}
                        </text>

                        <text
                            className="ipd-axis-title"
                            x={INNER_W / 2}
                            y={INNER_H + 42}
                            textAnchor="middle"
                        >
                            Model Prompt Personas
                        </text>
                    </g>
                </svg>
            </div>
        </div>
    );
}
