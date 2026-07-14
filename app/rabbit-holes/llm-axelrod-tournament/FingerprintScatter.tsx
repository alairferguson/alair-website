"use client";

import { useMemo, useState } from "react";
import type { MetricId, Player, Report, Series } from "./types";

type Filter = "all" | "llm" | "classic";

type Props = {
    report: Report;
    xMetric: MetricId;
    yMetric: MetricId;
    onXMetricChange: (id: MetricId) => void;
    onYMetricChange: (id: MetricId) => void;
    filter: Filter;
    onFilterChange: (filter: Filter) => void;
    highlightedId: string | null;
    onHighlight: (id: string | null) => void;
};

type PlacedPoint = {
    player: Player;
    /** True data position (unstacked) — used for series lines */
    dataX: number;
    dataY: number;
    /** Rendered marker position after stack offset */
    px: number;
    py: number;
    labelX: number;
    labelY: number;
    labelAnchor: "start" | "end";
    /** True when this point shares a location with others and was stacked */
    stacked: boolean;
    /** Draw a leader line from marker to label */
    showLeader: boolean;
};

const WIDTH = 960;
const HEIGHT = 660;
const MARGIN = { top: 36, right: 36, bottom: 56, left: 58 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

/** Points within this many px are treated as the same spot and stacked. */
const CLUSTER_EPS = 12;
const STACK_GAP = 15;
const LABEL_LINE = 14;
const LABEL_GAP_X = 12;

function metricValue(player: Player, id: MetricId): number {
    if (id === "mean_score_per_turn") return player.outcomes.meanScorePerTurn;
    return player.fingerprint[id];
}

function niceDomain(values: number[], fallback: [number, number]): [number, number] {
    if (!values.length) return fallback;
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return [min - 0.05, max + 0.05];
    const pad = (max - min) * 0.08;
    return [min - pad, max + pad];
}

function scale(domain: [number, number], range: [number, number]) {
    const [d0, d1] = domain;
    const [r0, r1] = range;
    const span = d1 - d0 || 1;
    return (v: number) => r0 + ((v - d0) / span) * (r1 - r0);
}

function ticks(domain: [number, number], count = 5): number[] {
    const [min, max] = domain;
    if (max <= min) return [min];
    const step = (max - min) / count;
    return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

function formatTickClean(v: number): string {
    if (Math.abs(v) >= 10) return v.toFixed(1);
    return Number(v.toFixed(2)).toString();
}

function pointLabel(player: Player): string {
    return player.kind === "llm" ? player.shortLabel : player.label;
}

/**
 * Cluster co-located points and stack markers + labels so every name stays readable.
 */
function placePoints(
    visible: Player[],
    xOf: (v: number) => number,
    yOf: (v: number) => number,
    xMetric: MetricId,
    yMetric: MetricId,
): PlacedPoint[] {
    const raw = visible.map((player) => ({
        player,
        dataX: xOf(metricValue(player, xMetric)),
        dataY: yOf(metricValue(player, yMetric)),
    }));

    const clusters = new Map<string, typeof raw>();
    for (const point of raw) {
        const key = `${Math.round(point.dataX / CLUSTER_EPS)}:${Math.round(point.dataY / CLUSTER_EPS)}`;
        const list = clusters.get(key);
        if (list) list.push(point);
        else clusters.set(key, [point]);
    }

    const placed: PlacedPoint[] = [];

    for (const group of clusters.values()) {
        // Stable, readable order within a stack: classics first, then by label.
        group.sort((a, b) => {
            if (a.player.kind !== b.player.kind) {
                return a.player.kind === "classic" ? -1 : 1;
            }
            return pointLabel(a.player).localeCompare(pointLabel(b.player));
        });

        const n = group.length;
        const anchorX = group.reduce((s, p) => s + p.dataX, 0) / n;
        const anchorY = group.reduce((s, p) => s + p.dataY, 0) / n;
        const labelOnRight = anchorX < INNER_W * 0.62;
        const labelAnchor: "start" | "end" = labelOnRight ? "start" : "end";

        const stackHeight = (n - 1) * STACK_GAP;
        let stackOriginY = anchorY - stackHeight / 2;
        stackOriginY = Math.max(6, Math.min(stackOriginY, INNER_H - 6 - stackHeight));

        const labelHeight = (n - 1) * LABEL_LINE;
        let labelOriginY = anchorY - labelHeight / 2 + 4;
        labelOriginY = Math.max(10, Math.min(labelOriginY, INNER_H - 4 - labelHeight));

        const stacked = n > 1;
        // Give stacked labels a bit more breathing room so leaders read clearly.
        const stackLabelX = labelOnRight
            ? Math.min(anchorX + (stacked ? 22 : LABEL_GAP_X), INNER_W - 4)
            : Math.max(anchorX - (stacked ? 22 : LABEL_GAP_X), 4);

        group.forEach((point, i) => {
            placed.push({
                player: point.player,
                dataX: point.dataX,
                dataY: point.dataY,
                px: anchorX,
                py: stackOriginY + i * STACK_GAP,
                labelX: stackLabelX,
                labelY: labelOriginY + i * LABEL_LINE,
                labelAnchor,
                stacked,
                showLeader: stacked,
            });
        });
    }

    // Nudge labels that still collide across nearby clusters.
    return resolveLabelCollisions(placed);
}

function resolveLabelCollisions(points: PlacedPoint[]): PlacedPoint[] {
    const sorted = [...points].sort((a, b) => a.labelY - b.labelY || a.labelX - b.labelX);
    const adjusted = sorted.map((p) => ({ ...p }));

    for (let i = 1; i < adjusted.length; i++) {
        const prev = adjusted[i - 1];
        const curr = adjusted[i];
        const sameSide = prev.labelAnchor === curr.labelAnchor;
        const closeX = Math.abs(prev.labelX - curr.labelX) < 120;
        if (!sameSide || !closeX) continue;
        const minY = prev.labelY + LABEL_LINE;
        if (curr.labelY < minY) {
            curr.labelY = minY;
            // Collision nudge moved this label off its marker — add a leader.
            if (Math.abs(curr.labelY - curr.py) > LABEL_LINE * 0.6) {
                curr.showLeader = true;
            }
        }
    }

    // If we pushed past the bottom, pull the whole colliding run up.
    for (let i = adjusted.length - 1; i >= 0; i--) {
        if (adjusted[i].labelY > INNER_H - 2) {
            adjusted[i].labelY = INNER_H - 2;
        }
        if (i > 0) {
            const prev = adjusted[i - 1];
            const curr = adjusted[i];
            const sameSide = prev.labelAnchor === curr.labelAnchor;
            const closeX = Math.abs(prev.labelX - curr.labelX) < 120;
            if (sameSide && closeX && curr.labelY - prev.labelY < LABEL_LINE) {
                prev.labelY = curr.labelY - LABEL_LINE;
                if (Math.abs(prev.labelY - prev.py) > LABEL_LINE * 0.6) {
                    prev.showLeader = true;
                }
            }
        }
    }

    return adjusted;
}

function leaderPath(point: PlacedPoint): string {
    // Elbow: leave the marker horizontally, then drop/rise to the label baseline.
    const endX =
        point.labelAnchor === "start" ? point.labelX - 2 : point.labelX + 2;
    const midX =
        point.labelAnchor === "start"
            ? point.px + 8
            : point.px - 8;
    const labelMidY = point.labelY - 3;
    return `M${point.px.toFixed(1)},${point.py.toFixed(1)} L${midX.toFixed(1)},${point.py.toFixed(1)} L${midX.toFixed(1)},${labelMidY.toFixed(1)} L${endX.toFixed(1)},${labelMidY.toFixed(1)}`;
}

export default function FingerprintScatter({
    report,
    xMetric,
    yMetric,
    onXMetricChange,
    onYMetricChange,
    filter,
    onFilterChange,
    highlightedId,
    onHighlight,
}: Props) {
    const [hoverId, setHoverId] = useState<string | null>(null);

    const xMeta = report.metrics.find((m) => m.id === xMetric)!;
    const yMeta = report.metrics.find((m) => m.id === yMetric)!;

    const visible = useMemo(() => {
        return report.players.filter((p) => {
            if (filter === "all") return true;
            return p.kind === filter;
        });
    }, [report.players, filter]);

    const visibleIds = useMemo(() => new Set(visible.map((p) => p.id)), [visible]);

    const xDomain = useMemo<[number, number]>(() => {
        if (xMeta.domain !== "auto") return xMeta.domain;
        return niceDomain(
            visible.map((p) => metricValue(p, xMetric)),
            [0, 1],
        );
    }, [visible, xMetric, xMeta]);

    const yDomain = useMemo<[number, number]>(() => {
        if (yMeta.domain !== "auto") return yMeta.domain;
        return niceDomain(
            visible.map((p) => metricValue(p, yMetric)),
            [0, 1],
        );
    }, [visible, yMetric, yMeta]);

    const x = useMemo(() => scale(xDomain, [0, INNER_W]), [xDomain]);
    const y = useMemo(() => scale(yDomain, [INNER_H, 0]), [yDomain]);

    const points = useMemo(
        () => placePoints(visible, x, y, xMetric, yMetric),
        [visible, x, y, xMetric, yMetric],
    );

    const seriesPaths = useMemo(() => {
        return report.series
            .map((series: Series) => {
                const pts = series.playerIds
                    .filter((id) => visibleIds.has(id))
                    .map((id) => {
                        const player = report.players.find((p) => p.id === id)!;
                        return {
                            x: x(metricValue(player, xMetric)),
                            y: y(metricValue(player, yMetric)),
                        };
                    });
                if (pts.length < 2) return null;
                const d = pts
                    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
                    .join(" ");
                return { series, d };
            })
            .filter(Boolean) as Array<{ series: Series; d: string }>;
    }, [report.series, report.players, visibleIds, x, y, xMetric, yMetric]);

    // Popup is hover-only so it clears as soon as the pointer leaves a point.
    const hovered = hoverId
        ? report.players.find((p) => p.id === hoverId) ?? null
        : null;
    const hoveredPoint = hovered
        ? points.find((p) => p.player.id === hovered.id) ?? null
        : null;

    const activeId = hoverId ?? highlightedId;
    const active = activeId
        ? report.players.find((p) => p.id === activeId) ?? null
        : null;

    const xTicks = ticks(xDomain, 5);
    const yTicks = ticks(yDomain, 5);

    function clearHover() {
        setHoverId(null);
        onHighlight(null);
    }

    return (
        <div className="ipd-chart-shell">
            <div className="ipd-chart-toolbar">
                <div className="ipd-axis-group">
                    <span className="ipd-axis-label ipd-mono">X</span>
                    <div className="ipd-toggle" role="group" aria-label="X axis metric">
                        {report.metrics.map((metric) => (
                            <button
                                key={`x-${metric.id}`}
                                type="button"
                                data-active={metric.id === xMetric}
                                onClick={() => onXMetricChange(metric.id)}
                            >
                                {metric.shortLabel}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="ipd-axis-group">
                    <span className="ipd-axis-label ipd-mono">Y</span>
                    <div className="ipd-toggle" role="group" aria-label="Y axis metric">
                        {report.metrics.map((metric) => (
                            <button
                                key={`y-${metric.id}`}
                                type="button"
                                data-active={metric.id === yMetric}
                                onClick={() => onYMetricChange(metric.id)}
                            >
                                {metric.shortLabel}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="ipd-filter" role="group" aria-label="Player filter">
                    {(
                        [
                            ["all", "All"],
                            ["llm", "LLMs"],
                            ["classic", "Classics"],
                        ] as const
                    ).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            data-active={filter === id}
                            onClick={() => onFilterChange(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="ipd-chart" onMouseLeave={clearHover}>
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    role="img"
                    aria-label={`${yMeta.label} against ${xMeta.label}`}
                >
                    <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                        {yTicks.map((tick) => (
                            <line
                                key={`y-${tick}`}
                                className="ipd-gridline"
                                x1={0}
                                x2={INNER_W}
                                y1={y(tick)}
                                y2={y(tick)}
                            />
                        ))}
                        {xTicks.map((tick) => (
                            <line
                                key={`x-${tick}`}
                                className="ipd-gridline"
                                x1={x(tick)}
                                x2={x(tick)}
                                y1={0}
                                y2={INNER_H}
                            />
                        ))}

                        {seriesPaths.map(({ series, d }) => (
                            <path
                                key={series.id}
                                className="ipd-series"
                                d={d}
                                stroke={series.color}
                            />
                        ))}

                        {yTicks.map((tick) => (
                            <text
                                key={`yl-${tick}`}
                                className="ipd-axis-tick ipd-mono"
                                x={-10}
                                y={y(tick)}
                                textAnchor="end"
                                dominantBaseline="middle"
                            >
                                {formatTickClean(tick)}
                            </text>
                        ))}
                        {xTicks.map((tick) => (
                            <text
                                key={`xl-${tick}`}
                                className="ipd-axis-tick ipd-mono"
                                x={x(tick)}
                                y={INNER_H + 18}
                                textAnchor="middle"
                            >
                                {formatTickClean(tick)}
                            </text>
                        ))}

                        <text
                            className="ipd-axis-title"
                            x={INNER_W / 2}
                            y={INNER_H + 42}
                            textAnchor="middle"
                        >
                            {xMeta.label}
                        </text>
                        <text
                            className="ipd-axis-title"
                            transform={`translate(-42, ${INNER_H / 2}) rotate(-90)`}
                            textAnchor="middle"
                        >
                            {yMeta.label}
                        </text>

                        {/* Leader lines for stacked / displaced labels */}
                        {points
                            .filter((point) => point.showLeader)
                            .map((point) => {
                                const dimmed =
                                    activeId != null &&
                                    point.player.id !== activeId &&
                                    !(
                                        point.player.kind === "llm" &&
                                        active?.kind === "llm" &&
                                        point.player.model === active.model
                                    );
                                return (
                                    <path
                                        key={`leader-${point.player.id}`}
                                        className="ipd-leader"
                                        data-dimmed={dimmed}
                                        d={leaderPath(point)}
                                    />
                                );
                            })}

                        {/* Labels under markers so markers stay clickable on top */}
                        {points.map((point) => {
                            const dimmed =
                                activeId != null &&
                                point.player.id !== activeId &&
                                !(
                                    point.player.kind === "llm" &&
                                    active?.kind === "llm" &&
                                    point.player.model === active.model
                                );
                            return (
                                <text
                                    key={`label-${point.player.id}`}
                                    className="ipd-point-label ipd-mono"
                                    data-muted={point.player.kind === "classic"}
                                    data-dimmed={dimmed}
                                    x={point.labelX}
                                    y={point.labelY}
                                    textAnchor={point.labelAnchor}
                                >
                                    {pointLabel(point.player)}
                                </text>
                            );
                        })}

                        {points.map((point) => {
                            const { player, px, py } = point;
                            const dimmed =
                                activeId != null &&
                                player.id !== activeId &&
                                !(
                                    player.kind === "llm" &&
                                    active?.kind === "llm" &&
                                    player.model === active.model
                                );
                            return (
                                <g
                                    key={player.id}
                                    className="ipd-point-group"
                                    transform={`translate(${px}, ${py})`}
                                    onMouseEnter={() => {
                                        setHoverId(player.id);
                                        onHighlight(player.id);
                                    }}
                                    onMouseLeave={() => {
                                        setHoverId(null);
                                    }}
                                    onFocus={() => {
                                        setHoverId(player.id);
                                        onHighlight(player.id);
                                    }}
                                    onBlur={() => {
                                        setHoverId(null);
                                    }}
                                    onClick={() => onHighlight(player.id)}
                                >
                                    {/* Larger invisible hit target for stacked points */}
                                    <circle
                                        r={10}
                                        fill="transparent"
                                        className="ipd-point-hit"
                                    />
                                    {player.kind === "llm" ? (
                                        <path
                                            className="ipd-point"
                                            data-dimmed={dimmed}
                                            d="M0,-7 L4.2,-2.2 L8, -1.5 L5.1,2.3 L6,7 L0,4.2 L-6,7 L-5.1,2.3 L-8,-1.5 L-4.2,-2.2 Z"
                                            fill={player.color}
                                            stroke="#fff"
                                            strokeWidth={1.5}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={player.label}
                                        />
                                    ) : (
                                        <circle
                                            className="ipd-point"
                                            data-dimmed={dimmed}
                                            r={5.5}
                                            fill={player.color}
                                            stroke="#fff"
                                            strokeWidth={1.4}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={player.label}
                                        />
                                    )}
                                </g>
                            );
                        })}
                    </g>
                </svg>

                {hovered && hoveredPoint && (
                    <div
                        className="ipd-hover-card ipd-mono"
                        style={{
                            left: `clamp(0.75rem, ${(
                                ((MARGIN.left + hoveredPoint.px) / WIDTH) * 100
                            ).toFixed(2)}%, calc(100% - 16.5rem))`,
                            top: `clamp(0.75rem, ${(
                                ((MARGIN.top + hoveredPoint.py) / HEIGHT) * 100
                            ).toFixed(2)}%, calc(100% - 9rem))`,
                        }}
                    >
                        <strong>{hovered.label}</strong>
                        <dl>
                            <dt>{xMeta.shortLabel}</dt>
                            <dd>{metricValue(hovered, xMetric).toFixed(3)}</dd>
                            <dt>{yMeta.shortLabel}</dt>
                            <dd>{metricValue(hovered, yMetric).toFixed(3)}</dd>
                            <dt>Score/turn</dt>
                            <dd>{hovered.outcomes.meanScorePerTurn.toFixed(3)}</dd>
                            {hovered.nearestClassic && (
                                <>
                                    <dt>Nearest</dt>
                                    <dd>{hovered.nearestClassic.label}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
}
