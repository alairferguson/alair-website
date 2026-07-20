"use client";

import { useMemo, useState } from "react";
import SeriesLegend from "./SeriesLegend";
import type { MetricId, Player, Report, Series } from "./types";

type Filter = "all" | "llm" | "classic";

type ProjectionId = "behavior" | "punishment" | "outcome";

type Projection = {
    id: ProjectionId;
    label: string;
    x: MetricId;
    y: MetricId;
};

export const PROJECTIONS: Projection[] = [
    {
        id: "behavior",
        label: "Behavior",
        x: "cooperation_rate",
        y: "forgiveness",
    },
    {
        id: "punishment",
        label: "Punishment",
        x: "retaliation",
        y: "forgiveness",
    },
    {
        id: "outcome",
        label: "Outcome",
        x: "cooperation_rate",
        y: "mean_score_per_turn",
    },
];

function matchProjection(x: MetricId, y: MetricId): ProjectionId | null {
    return PROJECTIONS.find((p) => p.x === x && p.y === y)?.id ?? null;
}

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
    customOpen: boolean;
    onCustomOpenChange: (open: boolean) => void;
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
const MARGIN = { top: 36, right: 52, bottom: 56, left: 58 };
const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

/** Markers closer than this share one stacked position. */
const MARKER_MERGE = 10;
const STACK_GAP = 14;
/** Approx advance for 11px mono labels — used for AABB collision tests. */
const LABEL_CHAR_W = 6.5;
const LABEL_ASCENT = 9;
const LABEL_DESCENT = 3;
const LABEL_STEP = 13;
const LABEL_GAP_X = 9;
/** Prefer keeping labels within this distance of their marker. */
const MAX_LABEL_DY = 40;

const CLASSIC_PLOT_LABEL: Record<string, string> = {
    "Tit For Tat": "TFT",
    Grudger: "Grudger",
    "Win-Stay Lose-Shift": "WSLS",
    "GTFT: 0.33": "GTFT",
    Cooperator: "All-C",
    Defector: "All-D",
    "Random: 0.5": "Random",
};

const PERSONA_PLOT_LABEL: Record<string, string> = {
    neutral: "neut",
    cooperative: "coop",
    selfish: "self",
    payoff_only: "payoff",
};

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

/**
 * Compact on-plot name; full name stays in the hover card. Model is no
 * longer spelled out here — color carries model identity (see the legend
 * above the chart) — so LLM points are labeled by persona alone.
 */
function plotLabel(player: Player): string {
    if (player.kind === "classic") {
        return CLASSIC_PLOT_LABEL[player.label] ?? player.label;
    }
    const persona = player.persona ?? "";
    return PERSONA_PLOT_LABEL[persona] ?? persona;
}

function labelWidth(text: string): number {
    return Math.max(16, text.length * LABEL_CHAR_W);
}

type LabelBox = { x0: number; y0: number; x1: number; y1: number };

function boxOf(
    text: string,
    anchor: "start" | "end",
    labelX: number,
    labelY: number,
): LabelBox {
    const w = labelWidth(text);
    return {
        x0: anchor === "start" ? labelX : labelX - w,
        y0: labelY - LABEL_ASCENT,
        x1: anchor === "start" ? labelX + w : labelX,
        y1: labelY + LABEL_DESCENT,
    };
}

function boxesOverlap(a: LabelBox, b: LabelBox, pad = 0.75): boolean {
    return !(
        a.x1 + pad <= b.x0 ||
        b.x1 + pad <= a.x0 ||
        a.y1 + pad <= b.y0 ||
        b.y1 + pad <= a.y0
    );
}

function clampLabelY(y: number): number {
    return Math.max(LABEL_ASCENT + 1, Math.min(INNER_H - LABEL_DESCENT - 1, y));
}

type LabelCandidate = {
    labelAnchor: "start" | "end";
    labelX: number;
    labelY: number;
    box: LabelBox;
};

function labelCandidate(
    px: number,
    py: number,
    text: string,
    right: boolean,
    gap: number,
    dy: number,
): LabelCandidate {
    const w = labelWidth(text);
    const labelY = clampLabelY(py + 4 + dy);
    let labelAnchor: "start" | "end";
    let labelX: number;
    if (right) {
        labelAnchor = "start";
        labelX = Math.min(px + gap, INNER_W - 2);
        if (labelX + w > INNER_W - 2) labelX = Math.max(2, INNER_W - 2 - w);
    } else {
        labelAnchor = "end";
        labelX = Math.max(px - gap, 2);
        if (labelX - w < 2) labelX = Math.min(INNER_W - 2, 2 + w);
    }
    return {
        labelAnchor,
        labelX,
        labelY,
        box: boxOf(text, labelAnchor, labelX, labelY),
    };
}

function applyCandidate(point: PlacedPoint, candidate: LabelCandidate) {
    point.labelAnchor = candidate.labelAnchor;
    point.labelX = candidate.labelX;
    point.labelY = candidate.labelY;
}

/** Pack a small group of labels into one local column near their markers. */
function packNeighborhood(
    points: PlacedPoint[],
    ids: number[],
    frozen: LabelBox[],
) {
    const ordered = [...ids].sort(
        (a, b) =>
            points[a].py - points[b].py ||
            plotLabel(points[a].player).localeCompare(plotLabel(points[b].player)),
    );
    const meanPx =
        ordered.reduce((s, i) => s + points[i].px, 0) / ordered.length;
    const meanPy =
        ordered.reduce((s, i) => s + points[i].py, 0) / ordered.length;
    const maxW = Math.max(
        ...ordered.map((i) => labelWidth(plotLabel(points[i].player))),
    );

    let right = meanPx < INNER_W * 0.58;
    if (meanPx < 100) right = true;
    if (meanPx > INNER_W - 100) right = false;
    if (right && meanPx + 18 + maxW > INNER_W - 4) right = false;
    if (!right && meanPx - 18 - maxW < 4) right = true;

    const gap = 18;
    const stackH = (ordered.length - 1) * LABEL_STEP;
    const yShifts = [0];
    for (let k = 1; k <= 20; k++) {
        yShifts.push(k * LABEL_STEP, -k * LABEL_STEP);
    }

    for (const yShift of yShifts) {
        let y0 = clampLabelY(meanPy - stackH / 2 + 4 + yShift);
        if (y0 < LABEL_ASCENT + 1) y0 = LABEL_ASCENT + 1;
        if (y0 + stackH > INNER_H - LABEL_DESCENT - 1) {
            y0 = INNER_H - LABEL_DESCENT - 1 - stackH;
        }

        const trial: Array<{
            index: number;
            candidate: LabelCandidate;
        }> = [];
        let clear = true;

        for (let k = 0; k < ordered.length; k++) {
            const index = ordered[k];
            const text = plotLabel(points[index].player);
            const w = labelWidth(text);
            const labelY = y0 + k * LABEL_STEP;
            let labelX: number;
            let labelAnchor: "start" | "end";
            if (right) {
                labelAnchor = "start";
                labelX = Math.min(meanPx + gap, INNER_W - 2);
                if (labelX + w > INNER_W - 2) {
                    labelX = Math.max(2, INNER_W - 2 - w);
                }
            } else {
                labelAnchor = "end";
                labelX = Math.max(meanPx - gap, 2);
                if (labelX - w < 2) {
                    labelX = Math.min(INNER_W - 2, 2 + w);
                }
            }
            const box = boxOf(text, labelAnchor, labelX, labelY);
            if (frozen.some((b) => boxesOverlap(box, b))) {
                clear = false;
                break;
            }
            trial.push({
                index,
                candidate: { labelAnchor, labelX, labelY, box },
            });
        }

        if (!clear) continue;
        for (const { index, candidate } of trial) {
            applyCandidate(points[index], candidate);
            points[index].showLeader = true;
        }
        return;
    }

    // Last resort: place at the mean even if it clips a frozen box.
    let y0 = clampLabelY(meanPy - stackH / 2 + 4);
    for (let k = 0; k < ordered.length; k++) {
        const index = ordered[k];
        const candidate = labelCandidate(
            meanPx,
            meanPy,
            plotLabel(points[index].player),
            right,
            gap,
            0,
        );
        candidate.labelY = y0 + k * LABEL_STEP;
        candidate.box = boxOf(
            plotLabel(points[index].player),
            candidate.labelAnchor,
            candidate.labelX,
            candidate.labelY,
        );
        applyCandidate(points[index], candidate);
        points[index].showLeader = true;
    }
}

function findOverlapPair(points: PlacedPoint[]): [number, number] | null {
    const boxes = points.map((p) =>
        boxOf(plotLabel(p.player), p.labelAnchor, p.labelX, p.labelY),
    );
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
            if (boxesOverlap(boxes[i], boxes[j])) return [i, j];
        }
    }
    return null;
}

/**
 * Keep markers at (or stacked on) their data positions. Place short labels
 * beside them, searching nearby slots first so names stay attached to points.
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

    // Union markers that sit on top of each other.
    const parent = raw.map((_, i) => i);
    const find = (i: number): number => {
        while (parent[i] !== i) {
            parent[i] = parent[parent[i]];
            i = parent[i];
        }
        return i;
    };
    const unite = (a: number, b: number) => {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[rb] = ra;
    };
    for (let i = 0; i < raw.length; i++) {
        for (let j = i + 1; j < raw.length; j++) {
            const dx = raw[i].dataX - raw[j].dataX;
            const dy = raw[i].dataY - raw[j].dataY;
            if (dx * dx + dy * dy <= MARKER_MERGE * MARKER_MERGE) unite(i, j);
        }
    }
    const groups = new Map<number, typeof raw>();
    raw.forEach((point, i) => {
        const root = find(i);
        const list = groups.get(root);
        if (list) list.push(point);
        else groups.set(root, [point]);
    });

    const placed: PlacedPoint[] = [];
    for (const group of groups.values()) {
        group.sort((a, b) => {
            if (a.player.kind !== b.player.kind) {
                return a.player.kind === "classic" ? -1 : 1;
            }
            return plotLabel(a.player).localeCompare(plotLabel(b.player));
        });
        const n = group.length;
        const anchorX = group.reduce((s, p) => s + p.dataX, 0) / n;
        const anchorY = group.reduce((s, p) => s + p.dataY, 0) / n;
        const stacked = n > 1;
        const stackHeight = (n - 1) * STACK_GAP;
        let stackOriginY = anchorY - stackHeight / 2;
        stackOriginY = Math.max(6, Math.min(stackOriginY, INNER_H - 6 - stackHeight));

        group.forEach((point, i) => {
            placed.push({
                player: point.player,
                dataX: point.dataX,
                dataY: point.dataY,
                px: stacked ? anchorX : point.dataX,
                py: stacked ? stackOriginY + i * STACK_GAP : point.dataY,
                labelX: 0,
                labelY: 0,
                labelAnchor: "start",
                stacked,
                showLeader: false,
            });
        });
    }

    return placeLabels(placed);
}

function placeLabels(points: PlacedPoint[]): PlacedPoint[] {
    const adjusted = points.map((p) => ({ ...p }));
    const placedBoxes: LabelBox[] = [];
    const preplaced = new Set<number>();

    // Stacked marker piles get one tidy local callout first.
    const stackGroups = new Map<number, number[]>();
    adjusted.forEach((point, index) => {
        if (!point.stacked) return;
        const key = Math.round(point.px / 2);
        const list = stackGroups.get(key);
        if (list) list.push(index);
        else stackGroups.set(key, [index]);
    });
    for (const ids of stackGroups.values()) {
        packNeighborhood(adjusted, ids, placedBoxes);
        for (const index of ids) {
            const p = adjusted[index];
            placedBoxes.push(
                boxOf(plotLabel(p.player), p.labelAnchor, p.labelX, p.labelY),
            );
            preplaced.add(index);
        }
    }

    const order = adjusted
        .map((_, index) => index)
        .sort(
            (a, b) =>
                adjusted[a].py - adjusted[b].py ||
                adjusted[a].px - adjusted[b].px,
        );

    for (const index of order) {
        if (preplaced.has(index)) continue;
        const point = adjusted[index];
        const text = plotLabel(point.player);
        const preferRight = point.px < INNER_W * 0.62;
        const dys = [0];
        for (let k = 1; k <= Math.ceil(MAX_LABEL_DY / LABEL_STEP) + 1; k++) {
            dys.push(k * LABEL_STEP, -k * LABEL_STEP);
        }

        let best: LabelCandidate | null = null;
        outer: for (const dy of dys) {
            if (Math.abs(dy) > MAX_LABEL_DY) continue;
            for (const right of [preferRight, !preferRight]) {
                for (const gap of [LABEL_GAP_X, 16, 22]) {
                    const candidate = labelCandidate(
                        point.px,
                        point.py,
                        text,
                        right,
                        gap,
                        dy,
                    );
                    if (placedBoxes.some((b) => boxesOverlap(candidate.box, b))) {
                        continue;
                    }
                    best = candidate;
                    break outer;
                }
            }
        }

        if (!best) {
            // Expand the search rather than invent a distant global column.
            outer2: for (let dy = 0; dy < INNER_H; dy += LABEL_STEP) {
                for (const sign of [1, -1] as const) {
                    for (const right of [preferRight, !preferRight]) {
                        const candidate = labelCandidate(
                            point.px,
                            point.py,
                            text,
                            right,
                            22,
                            sign * dy,
                        );
                        if (
                            placedBoxes.some((b) =>
                                boxesOverlap(candidate.box, b),
                            )
                        ) {
                            continue;
                        }
                        best = candidate;
                        break outer2;
                    }
                }
            }
        }

        if (!best) {
            best = labelCandidate(
                point.px,
                point.py,
                text,
                preferRight,
                LABEL_GAP_X,
                0,
            );
        }

        applyCandidate(point, best);
        placedBoxes.push(best.box);
    }

    // If anything still collides, re-pack that local neighborhood only.
    for (let iter = 0; iter < 20; iter++) {
        const hit = findOverlapPair(adjusted);
        if (!hit) break;

        const boxes = adjusted.map((p) =>
            boxOf(plotLabel(p.player), p.labelAnchor, p.labelX, p.labelY),
        );
        const component = new Set(hit);
        let grew = true;
        while (grew) {
            grew = false;
            for (const i of [...component]) {
                for (let j = 0; j < adjusted.length; j++) {
                    if (component.has(j)) continue;
                    if (boxesOverlap(boxes[i], boxes[j])) {
                        component.add(j);
                        grew = true;
                    }
                }
            }
        }

        const frozen = adjusted
            .map((p, i) => ({
                i,
                box: boxOf(plotLabel(p.player), p.labelAnchor, p.labelX, p.labelY),
            }))
            .filter(({ i }) => !component.has(i))
            .map(({ box }) => box);

        packNeighborhood(adjusted, [...component], frozen);
    }

    for (const point of adjusted) {
        const dy = Math.abs(point.labelY - (point.py + 4));
        const dx = Math.abs(point.labelX - point.px);
        point.showLeader = point.stacked || dy > 8 || dx > LABEL_GAP_X + 14;
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
    customOpen,
    onCustomOpenChange,
}: Props) {
    const [hoverId, setHoverId] = useState<string | null>(null);

    const xMeta = report.metrics.find((m) => m.id === xMetric)!;
    const yMeta = report.metrics.find((m) => m.id === yMetric)!;
    const activeProjection = matchProjection(xMetric, yMetric);
    const isCustom = activeProjection == null;

    function selectProjection(projection: Projection) {
        onXMetricChange(projection.x);
        onYMetricChange(projection.y);
        onCustomOpenChange(false);
    }

    function setXAxis(id: MetricId) {
        onXMetricChange(id);
        if (matchProjection(id, yMetric) == null) {
            onCustomOpenChange(true);
        }
    }

    function setYAxis(id: MetricId) {
        onYMetricChange(id);
        if (matchProjection(xMetric, id) == null) {
            onCustomOpenChange(true);
        }
    }

    function toggleCustomAxes() {
        onCustomOpenChange(!customOpen);
    }

    const customSummary = isCustom
        ? `Custom · ${xMeta.shortLabel} × ${yMeta.shortLabel}`
        : "Custom axes";

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
                <div className="ipd-toolbar-primary">
                    <div className="ipd-axis-group">
                        <div
                            className="ipd-toggle"
                            role="group"
                            aria-label="Strategy space projection"
                        >
                            {PROJECTIONS.map((projection) => (
                                <button
                                    key={projection.id}
                                    type="button"
                                    data-active={
                                        !isCustom &&
                                        activeProjection === projection.id
                                    }
                                    onClick={() => selectProjection(projection)}
                                >
                                    {projection.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="ipd-custom-axes ipd-mono"
                            data-active={isCustom || customOpen}
                            data-open={customOpen}
                            aria-expanded={customOpen}
                            aria-controls="ipd-custom-axes-panel"
                            onClick={toggleCustomAxes}
                        >
                            <span>{customSummary}</span>
                            <span className="ipd-custom-axes-chevron" aria-hidden>
                                ▾
                            </span>
                        </button>
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

                <div className="ipd-toolbar-custom">
                    <SeriesLegend
                        series={report.series}
                        onHighlight={onHighlight}
                    />
                </div>

                {customOpen && (
                    <div
                        id="ipd-custom-axes-panel"
                        className="ipd-toolbar-custom"
                    >
                        <div className="ipd-axis-group">
                            <span className="ipd-axis-label ipd-mono">X</span>
                            <div
                                className="ipd-toggle"
                                role="group"
                                aria-label="X axis metric"
                            >
                                {report.metrics.map((metric) => (
                                    <button
                                        key={`x-${metric.id}`}
                                        type="button"
                                        data-active={metric.id === xMetric}
                                        onClick={() => setXAxis(metric.id)}
                                    >
                                        {metric.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="ipd-axis-group">
                            <span className="ipd-axis-label ipd-mono">Y</span>
                            <div
                                className="ipd-toggle"
                                role="group"
                                aria-label="Y axis metric"
                            >
                                {report.metrics.map((metric) => (
                                    <button
                                        key={`y-${metric.id}`}
                                        type="button"
                                        data-active={metric.id === yMetric}
                                        onClick={() => setYAxis(metric.id)}
                                    >
                                        {metric.shortLabel}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
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
                                    {plotLabel(point.player)}
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
