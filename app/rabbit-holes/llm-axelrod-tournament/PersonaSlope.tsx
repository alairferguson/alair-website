"use client";

import { useMemo, useState } from "react";
import type { MetricId, Player, Report, Series } from "./types";

type Props = {
    report: Report;
    highlightedId: string | null;
    onHighlight: (id: string | null) => void;
};

type ViewMode = "split" | "overlay";

type PersonaMeta = {
    id: string;
    label: string;
    shortLabel: string;
    blurb: string;
};

const PERSONA_META: PersonaMeta[] = [
    {
        id: "cooperative",
        label: "cooperative",
        shortLabel: "coop.",
        blurb: "Fair-minded framing that values mutual benefit and long-term trust.",
    },
    {
        id: "neutral",
        label: "neutral",
        shortLabel: "neutral",
        blurb: "Bare game instructions — cooperate or defect, no dispositional push.",
    },
    {
        id: "payoff_only",
        label: "payoff-only",
        shortLabel: "payoff",
        blurb: "Maximize own points with A/B action labels — no cooperate/defect language.",
    },
    {
        id: "selfish",
        label: "selfish",
        shortLabel: "selfish",
        blurb: "Ruthless self-interest: maximize your score with no regard for the other player.",
    },
];

const PERSONA_ORDER = PERSONA_META.map((p) => p.id);

const WIDTH = 960;
const HEIGHT = 440;
const MARGIN = { top: 40, right: 20, bottom: 42, left: 54 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;
const LABEL_GAP = 14;
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

function formatDelta(v: number): string {
    const sign = v > 0 ? "+" : v < 0 ? "−" : "";
    return `${sign}${Math.abs(v).toFixed(2)}`;
}

function diamondPath(size = 7): string {
    return `M0,${-size} L${size},0 L0,${size} L${-size},0 Z`;
}

type PlacedValue = {
    persona: string;
    player: Player;
    value: number;
    color: string;
    x: number;
    y: number;
    labelDX: number;
    labelDY: number;
};

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
    swing: number;
};

/**
 * Place value labels so co-located / near points never collide.
 * Prefer above the marker; flip below near the top edge; stagger vertically
 * (and slightly horizontally in overlay) when several share a column.
 */
function placeValueLabels(
    points: Array<{
        persona: string;
        player: Player;
        value: number;
        color: string;
        x: number;
        y: number;
    }>,
): PlacedValue[] {
    const byPersona = new Map<string, typeof points>();
    for (const pt of points) {
        const list = byPersona.get(pt.persona);
        if (list) list.push(pt);
        else byPersona.set(pt.persona, [pt]);
    }

    const placed: PlacedValue[] = [];

    for (const group of byPersona.values()) {
        group.sort((a, b) => a.y - b.y || a.player.id.localeCompare(b.player.id));
        const n = group.length;

        group.forEach((pt, i) => {
            const nearTop = pt.y < 22;
            const nearBottom = pt.y > INNER_H - 18;
            let labelDY: number;
            let labelDX = 0;

            if (n === 1) {
                if (nearTop) labelDY = 16;
                else if (nearBottom) labelDY = -14;
                else labelDY = -13;
            } else {
                // Overlay / stacked column: alternate above/below, nudge sideways.
                const above = !nearTop && (nearBottom || i % 2 === 0);
                labelDY = above ? -13 - Math.floor(i / 2) * LABEL_GAP : 16 + Math.floor(i / 2) * LABEL_GAP;
                labelDX = n > 1 ? (i % 2 === 0 ? -10 : 10) : 0;

                // If the pair is vertically separated enough, keep labels on their own markers.
                if (n === 2 && Math.abs(group[0].y - group[1].y) >= LABEL_GAP + 6) {
                    labelDY = nearTop ? 16 : -13;
                    labelDX = i === 0 ? -8 : 8;
                }
            }

            // Clamp so labels stay inside the plot band.
            const absY = pt.y + labelDY;
            if (absY < 8) labelDY = 8 - pt.y;
            if (absY > INNER_H - 4) labelDY = INNER_H - 4 - pt.y;

            placed.push({ ...pt, labelDX, labelDY });
        });

        // Final vertical deconflict within the column.
        const col = placed
            .filter((p) => p.persona === group[0].persona)
            .sort((a, b) => a.y + a.labelDY - (b.y + b.labelDY));
        for (let i = 1; i < col.length; i++) {
            const prev = col[i - 1];
            const curr = col[i];
            const prevAbs = prev.y + prev.labelDY;
            const currAbs = curr.y + curr.labelDY;
            if (currAbs - prevAbs < LABEL_GAP && Math.abs(curr.labelDX - prev.labelDX) < 18) {
                curr.labelDY = prevAbs + LABEL_GAP - curr.y;
                if (curr.y + curr.labelDY > INNER_H - 4) {
                    // Push the earlier label up instead.
                    prev.labelDY = curr.y + curr.labelDY - LABEL_GAP - prev.y;
                    if (prev.y + prev.labelDY < 8) {
                        prev.labelDY = 8 - prev.y;
                        curr.labelDY = prev.y + prev.labelDY + LABEL_GAP - curr.y;
                    }
                }
            }
        }
    }

    return placed;
}

export default function PersonaSlope({
    report,
    highlightedId,
    onHighlight,
}: Props) {
    const [metric, setMetric] = useState<MetricId>("cooperation_rate");
    const [viewMode, setViewMode] = useState<ViewMode>("split");
    const [hoverPersona, setHoverPersona] = useState<string | null>(null);
    const [focusPersona, setFocusPersona] = useState<string | null>(null);
    const [hoverPlayerId, setHoverPlayerId] = useState<string | null>(null);

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
                const first = points[0].value;
                const last = points[points.length - 1].value;
                return {
                    series,
                    raw: points,
                    swing: last - first,
                };
            })
            .filter(Boolean) as Array<{
            series: Series;
            raw: Array<{ persona: string; player: Player; value: number }>;
            swing: number;
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

    const panels = useMemo(() => {
        if (viewMode === "overlay") {
            return [{ id: "all", label: null as string | null, curves }];
        }
        return curves.map((c) => ({
            id: c.series.id,
            label: c.series.label,
            curves: [c],
        }));
    }, [viewMode, curves]);

    const laidOut = useMemo(() => {
        const panelCount = Math.max(panels.length, 1);
        const gap = viewMode === "split" ? 36 : 0;
        const panelW = (INNER_W - gap * (panelCount - 1)) / panelCount;
        // Inset endpoints so edge labels ("cooperative", "selfish") don't clip.
        const xPad = Math.min(28, panelW * 0.08);

        return panels.map((panel, panelIndex) => {
            const offsetX = panelIndex * (panelW + gap);
            const xOf = (i: number) =>
                offsetX +
                xPad +
                (i / Math.max(PERSONA_ORDER.length - 1, 1)) * (panelW - 2 * xPad);

            const modelCurves: ModelCurve[] = panel.curves.map((curve) => {
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
                    swing: curve.swing,
                };
            });

            const valueLabels = placeValueLabels(
                modelCurves.flatMap((curve) =>
                    curve.points.map((pt) => ({
                        ...pt,
                        color: curve.series.color,
                    })),
                ),
            );

            return {
                ...panel,
                offsetX,
                panelW,
                xOf,
                modelCurves,
                valueLabels,
            };
        });
    }, [panels, yOf, viewMode]);

    const personaMeta = PERSONA_META.find((p) => p.id === activePersona) ?? null;

    const personaReadout = useMemo(() => {
        if (!activePersona) return null;
        return curves
            .map((curve) => {
                const pt = curve.raw.find((p) => p.persona === activePersona);
                if (!pt) return null;
                return {
                    model: curve.series.label,
                    color: curve.series.color,
                    value: pt.value,
                    player: pt.player,
                };
            })
            .filter(Boolean) as Array<{
            model: string;
            color: string;
            value: number;
            player: Player;
        }>;
    }, [activePersona, curves]);

    const crossModelGap = useMemo(() => {
        if (!personaReadout || personaReadout.length < 2) return null;
        const vals = personaReadout.map((r) => r.value);
        return Math.max(...vals) - Math.min(...vals);
    }, [personaReadout]);

    const activePlayerId = hoverPlayerId ?? highlightedId;
    const activePlayer = activePlayerId
        ? report.players.find((p) => p.id === activePlayerId) ?? null
        : null;

    function clearHover() {
        setHoverPersona(null);
        setHoverPlayerId(null);
    }

    function togglePersona(id: string) {
        setFocusPersona((prev) => (prev === id ? null : id));
    }

    if (!curves.length) return null;

    const useShortXTicks = viewMode === "split";

    return (
        <div className="ipd-chart-shell ipd-slope-shell">
            <div className="ipd-chart-toolbar">
                <div className="ipd-axis-group">
                    <span className="ipd-axis-label ipd-mono">Metric</span>
                    <div className="ipd-toggle" role="group" aria-label="Slope metric">
                        {report.metrics
                            .filter((m) => FINGERPRINT_METRICS.includes(m.id))
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
                <div className="ipd-filter" role="group" aria-label="Slope layout">
                    {(
                        [
                            ["split", "Side by side"],
                            ["overlay", "Overlay"],
                        ] as const
                    ).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            data-active={viewMode === id}
                            onClick={() => setViewMode(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ipd-slope-layout">
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

                            {laidOut.map((panel) => (
                                <g key={panel.id}>
                                    {PERSONA_ORDER.map((persona, i) => {
                                        const x = panel.xOf(i);
                                        const active =
                                            activePersona == null ||
                                            activePersona === persona;
                                        const laneW =
                                            panel.panelW / PERSONA_ORDER.length;
                                        return (
                                            <g key={`${panel.id}-${persona}`}>
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
                                                    onClick={() =>
                                                        togglePersona(persona)
                                                    }
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

                                    {panel.label && (
                                        <text
                                            className="ipd-slope-model"
                                            x={panel.offsetX + panel.panelW / 2}
                                            y={-14}
                                            textAnchor="middle"
                                        >
                                            {panel.label}
                                        </text>
                                    )}
                                </g>
                            ))}

                            {laidOut.flatMap((panel) =>
                                panel.modelCurves.map((curve) => {
                                    const seriesDimmed =
                                        activePlayer != null &&
                                        activePlayer.kind === "llm" &&
                                        activePlayer.model !== curve.series.id;
                                    return (
                                        <path
                                            key={`${panel.id}-${curve.series.id}-line`}
                                            className="ipd-slope-line"
                                            d={curve.path}
                                            stroke={curve.series.color}
                                            data-dimmed={seriesDimmed}
                                        />
                                    );
                                }),
                            )}

                            {laidOut.flatMap((panel) =>
                                panel.modelCurves.flatMap((curve) =>
                                    curve.points.map((pt) => {
                                        const isActive =
                                            activePlayerId === pt.player.id ||
                                            activePersona === pt.persona;
                                        const dimmed =
                                            (activePlayerId != null &&
                                                activePlayerId !==
                                                    pt.player.id &&
                                                activePersona !== pt.persona) ||
                                            (activePersona != null &&
                                                activePersona !== pt.persona &&
                                                activePlayerId == null);
                                        return (
                                            <g
                                                key={pt.player.id}
                                                className="ipd-point-group"
                                                transform={`translate(${pt.x}, ${pt.y})`}
                                                onMouseEnter={() => {
                                                    setHoverPersona(pt.persona);
                                                    setHoverPlayerId(
                                                        pt.player.id,
                                                    );
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
                                ),
                            )}

                            {/* Value labels rendered after markers so halo wins; positions pre-resolved. */}
                            {laidOut.flatMap((panel) =>
                                panel.valueLabels.map((pt) => {
                                    const isActive =
                                        activePlayerId === pt.player.id ||
                                        activePersona === pt.persona;
                                    const dimmed =
                                        (activePlayerId != null &&
                                            activePlayerId !== pt.player.id &&
                                            activePersona !== pt.persona) ||
                                        (activePersona != null &&
                                            activePersona !== pt.persona &&
                                            activePlayerId == null);
                                    return (
                                        <text
                                            key={`val-${pt.player.id}`}
                                            className="ipd-slope-value ipd-mono"
                                            x={pt.x + pt.labelDX}
                                            y={pt.y + pt.labelDY}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            data-dimmed={dimmed}
                                            data-active={isActive}
                                        >
                                            {formatVal(pt.value)}
                                        </text>
                                    );
                                }),
                            )}

                            {laidOut.map((panel) =>
                                PERSONA_ORDER.map((persona, i) => {
                                    const meta = PERSONA_META.find(
                                        (p) => p.id === persona,
                                    )!;
                                    return (
                                        <text
                                            key={`${panel.id}-xl-${persona}`}
                                            className="ipd-axis-tick ipd-mono ipd-slope-xtick"
                                            data-active={
                                                activePersona === persona
                                            }
                                            x={panel.xOf(i)}
                                            y={INNER_H + 20}
                                            textAnchor="middle"
                                            onClick={() =>
                                                togglePersona(persona)
                                            }
                                            onMouseEnter={() =>
                                                setHoverPersona(persona)
                                            }
                                        >
                                            {useShortXTicks
                                                ? meta.shortLabel
                                                : meta.label}
                                        </text>
                                    );
                                }),
                            )}

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
                        </g>
                    </svg>
                </div>

                <aside className="ipd-slope-aside" aria-live="polite">
                    {personaMeta && personaReadout ? (
                        <>
                            <p className="ipd-kicker ipd-mono">Persona</p>
                            <h3>{personaMeta.label}</h3>
                            <p className="ipd-slope-blurb">{personaMeta.blurb}</p>
                            <dl className="ipd-slope-readout ipd-mono">
                                {personaReadout.map((row) => (
                                    <div key={row.model}>
                                        <dt>
                                            <span
                                                className="ipd-swatch"
                                                style={{
                                                    background: row.color,
                                                }}
                                            />
                                            <span className="ipd-slope-model-name">
                                                {row.model}
                                            </span>
                                        </dt>
                                        <dd>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onHighlight(row.player.id)
                                                }
                                            >
                                                {formatVal(row.value)}
                                            </button>
                                        </dd>
                                    </div>
                                ))}
                                {crossModelGap != null && (
                                    <div className="ipd-slope-gap">
                                        <dt>Model gap</dt>
                                        <dd>{crossModelGap.toFixed(2)}</dd>
                                    </div>
                                )}
                            </dl>
                            {focusPersona && (
                                <button
                                    type="button"
                                    className="ipd-slope-clear"
                                    onClick={() => setFocusPersona(null)}
                                >
                                    Clear focus
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="ipd-kicker ipd-mono">Reading</p>
                            <h3>Persona moves the needle</h3>
                            <p className="ipd-slope-blurb">
                                Same four system prompts on each model. Hover a
                                column to compare models at that disposition;
                                click to pin it. Overlay mode stacks the curves
                                so the shared swing is obvious.
                            </p>
                            <ul className="ipd-slope-swings ipd-mono">
                                {curves.map((curve) => (
                                    <li key={curve.series.id}>
                                        <span
                                            className="ipd-swatch"
                                            style={{
                                                background: curve.series.color,
                                            }}
                                        />
                                        <span className="ipd-slope-model-name">
                                            {curve.series.label}
                                        </span>
                                        <strong>
                                            {formatDelta(curve.swing)}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </aside>
            </div>
        </div>
    );
}
