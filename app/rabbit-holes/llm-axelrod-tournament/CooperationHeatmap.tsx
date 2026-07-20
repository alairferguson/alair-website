"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import SeriesLegend from "./SeriesLegend";
import type { Player, Report } from "./types";

type ViewMode = "llm-classic" | "llm-llm" | "full";
type SortMode = "model" | "persona";

/** Fixed persona grouping order when sorting "by persona". */
const PERSONA_ORDER = ["cooperative", "neutral", "payoff_only", "selfish"];

type Props = {
    report: Report;
    highlightedId: string | null;
    onHighlight: (id: string | null) => void;
};

type HoverCell = {
    rowId: string;
    colId: string;
    value: number;
};

/** Hovered cell's box, relative to the `.ipd-heatmap` container. */
type CellRect = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};

const CELL = 17.5;
const LABEL_W = 80;
const LABEL_H = 78;
const LEGEND_W = 12;
const LEGEND_GAP = 14;
const PAD = { top: 8, right: 10, bottom: 10, left: 8 };

/** Sequential scale ending at the site primary red (`--primary` / `--ipd-link`). */
const COOP_LOW = { r: 247, g: 240, b: 240 };
const COOP_HIGH = { r: 0x91, g: 0x0a, b: 0x07 };

function coopFill(v: number): string {
    const t = Math.max(0, Math.min(1, v));
    const r = Math.round(COOP_LOW.r + (COOP_HIGH.r - COOP_LOW.r) * t);
    const g = Math.round(COOP_LOW.g + (COOP_HIGH.g - COOP_LOW.g) * t);
    const b = Math.round(COOP_LOW.b + (COOP_HIGH.b - COOP_LOW.b) * t);
    return `rgb(${r} ${g} ${b})`;
}

function compactPersona(persona: string | null): string {
    switch (persona) {
        case "cooperative":
            return "coop";
        case "payoff_only":
            return "payoff";
        case "neutral":
            return "neutral";
        case "selfish":
            return "selfish";
        default:
            return persona ?? "";
    }
}

const CLASSIC_SHORT: Record<string, string> = {
    "Tit For Tat": "Tit for Tat",
    "Win-Stay Lose-Shift": "Win-Stay",
    "GTFT: 0.33": "GTFT",
    "Random: 0.5": "Random",
    Grudger: "Grudger",
    Cooperator: "Cooperator",
    Defector: "Defector",
};

/**
 * Model is dropped from the label text — color carries model identity now
 * (the label itself is tinted with the player's color; see the legend
 * above the chart) — so LLM rows/columns are labeled by persona alone.
 */
function axisLabel(player: Player): string {
    if (player.kind === "llm") {
        return compactPersona(player.persona);
    }
    return CLASSIC_SHORT[player.label] ?? player.label;
}

export default function CooperationHeatmap({
    report,
    highlightedId,
    onHighlight,
}: Props) {
    const [view, setView] = useState<ViewMode>("llm-classic");
    const [sortMode, setSortMode] = useState<SortMode>("model");
    const [hover, setHover] = useState<HoverCell | null>(null);
    const [cellRect, setCellRect] = useState<CellRect | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    /** Lets prose links (`[by persona](#cooperation-matrix:persona)`) drive the sort/view toggles above, same mechanism as the Strategy Space projections. */
    useEffect(() => {
        function onFigureAction(event: Event) {
            const { target, action } = (
                event as CustomEvent<{ target: string; action: string }>
            ).detail;
            if (target !== "cooperation-matrix") return;
            if (action === "persona" || action === "model") {
                setSortMode(action);
                setView("llm-classic");
            }
        }

        window.addEventListener("ipd:figure-action", onFigureAction);
        return () =>
            window.removeEventListener("ipd:figure-action", onFigureAction);
    }, []);

    const byId = useMemo(() => {
        const map = new Map<string, Player>();
        for (const player of report.players) map.set(player.id, player);
        return map;
    }, [report.players]);

    const { rowIds, colIds } = useMemo(() => {
        const order = report.cooperationMatrix.players.filter((id) =>
            byId.has(id),
        );
        let llms = order.filter((id) => byId.get(id)?.kind === "llm");
        const classics = order.filter((id) => byId.get(id)?.kind === "classic");

        if (sortMode === "persona") {
            // `llms` starts model-grouped (report.json order); stable-sort by
            // persona so each model's relative position is preserved within
            // a persona group, keeping the model legend order recognizable.
            llms = [...llms].sort((a, b) => {
                const pa = byId.get(a)?.persona ?? "";
                const pb = byId.get(b)?.persona ?? "";
                return PERSONA_ORDER.indexOf(pa) - PERSONA_ORDER.indexOf(pb);
            });
        }

        if (view === "llm-classic") {
            return { rowIds: llms, colIds: classics };
        }
        if (view === "llm-llm") {
            return { rowIds: llms, colIds: llms };
        }
        return { rowIds: [...classics, ...llms], colIds: [...classics, ...llms] };
    }, [report.cooperationMatrix.players, byId, view, sortMode]);

    const width =
        PAD.left +
        LABEL_W +
        colIds.length * CELL +
        LEGEND_GAP +
        LEGEND_W +
        40 +
        PAD.right;
    const height = PAD.top + LABEL_H + rowIds.length * CELL + PAD.bottom;

    const values = report.cooperationMatrix.values;

    function cellValue(rowId: string, colId: string): number {
        return values[rowId]?.[colId] ?? 0;
    }

    function cellReverse(rowId: string, colId: string): number | null {
        return values[colId]?.[rowId] ?? null;
    }

    const hoveredRow = hover?.rowId ?? null;
    const hoveredCol = hover?.colId ?? null;
    const activeId = highlightedId;
    const activePlayer = activeId ? (byId.get(activeId) ?? null) : null;

    /** True if `id` is the active player, or shares its model — lets a legend/leaderboard hover select every persona of that model. */
    function isModelActive(id: string): boolean {
        if (id === activeId) return true;
        if (!activePlayer || activePlayer.kind !== "llm") return false;
        const player = byId.get(id);
        return player?.kind === "llm" && player.model === activePlayer.model;
    }

    function cellDimmed(rowId: string, colId: string): boolean {
        if (hover) {
            return rowId !== hover.rowId && colId !== hover.colId;
        }
        if (activeId) {
            return !isModelActive(rowId) && !isModelActive(colId);
        }
        return false;
    }

    function clearHover() {
        setHover(null);
        setCellRect(null);
    }

    /** Record the hovered/focused cell's box, relative to the container, so the tooltip can be placed around it. */
    function trackCell(el: SVGRectElement) {
        const container = containerRef.current;
        if (!container) return;
        const cellBox = el.getBoundingClientRect();
        const containerBox = container.getBoundingClientRect();
        setCellRect({
            left: cellBox.left - containerBox.left,
            top: cellBox.top - containerBox.top,
            right: cellBox.right - containerBox.left,
            bottom: cellBox.bottom - containerBox.top,
        });
    }

    /**
     * Places the tooltip beside the hovered cell — right/below by default,
     * flipping to left/above when that would spill past the container —
     * so it never sits on top of the cell (and the cursor on it) or the
     * axis labels, which only live above/left of the grid.
     */
    useLayoutEffect(() => {
        const container = containerRef.current;
        const card = cardRef.current;
        if (!hover || !cellRect || !container || !card) return;

        const GAP = 10;
        const EDGE = 4;
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const cardW = card.offsetWidth;
        const cardH = card.offsetHeight;

        let left = cellRect.right + GAP;
        let top = cellRect.bottom + GAP;

        if (left + cardW > containerW - EDGE) {
            left = cellRect.left - GAP - cardW;
        }
        if (top + cardH > containerH - EDGE) {
            top = cellRect.top - GAP - cardH;
        }

        left = Math.max(EDGE, Math.min(left, containerW - cardW - EDGE));
        top = Math.max(EDGE, Math.min(top, containerH - cardH - EDGE));

        card.style.left = `${left}px`;
        card.style.top = `${top}px`;
    }, [hover, cellRect]);

    const hoverRowPlayer = hover ? byId.get(hover.rowId) : null;
    const hoverColPlayer = hover ? byId.get(hover.colId) : null;
    const reverseValue =
        hover != null ? cellReverse(hover.rowId, hover.colId) : null;
    const primaryFrom = hoverRowPlayer;
    const primaryTo = hoverColPlayer;

    return (
        <div className="ipd-chart-shell">
            <div className="ipd-chart-toolbar">
                <div className="ipd-toolbar-primary">
                    <div
                        className="ipd-toggle"
                        role="group"
                        aria-label="Cooperation matrix view"
                    >
                        <button
                            type="button"
                            data-active={view === "llm-classic"}
                            onClick={() => setView("llm-classic")}
                        >
                            LLMs × Classics
                        </button>
                        <button
                            type="button"
                            data-active={view === "llm-llm"}
                            onClick={() => setView("llm-llm")}
                        >
                            LLMs × LLMs
                        </button>
                        <button
                            type="button"
                            data-active={view === "full"}
                            onClick={() => setView("full")}
                        >
                            Full matrix
                        </button>
                    </div>
                    <div className="ipd-axis-group">
                        <span className="ipd-axis-label ipd-mono">
                            Sort LLMs
                        </span>
                        <div
                            className="ipd-toggle"
                            role="group"
                            aria-label="LLM sort order"
                        >
                            <button
                                type="button"
                                data-active={sortMode === "model"}
                                onClick={() => setSortMode("model")}
                            >
                                By model
                            </button>
                            <button
                                type="button"
                                data-active={sortMode === "persona"}
                                onClick={() => setSortMode("persona")}
                            >
                                By persona
                            </button>
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
                ref={containerRef}
                className="ipd-heatmap"
                onMouseLeave={() => {
                    clearHover();
                    onHighlight(null);
                }}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    width={width}
                    height={height}
                    role="img"
                    aria-label="Cooperation rate between players"
                >
                    <g
                        transform={`translate(${PAD.left + LABEL_W}, ${
                            PAD.top + LABEL_H
                        })`}
                    >
                        {colIds.map((colId, ci) => {
                            const player = byId.get(colId)!;
                            const active =
                                colId === hoveredCol || isModelActive(colId);
                            return (
                                <text
                                    key={`col-${colId}`}
                                    className="ipd-heatmap-label ipd-mono"
                                    data-active={active}
                                    style={
                                        player.kind === "llm"
                                            ? { fill: player.color }
                                            : undefined
                                    }
                                    transform={`translate(${
                                        ci * CELL + CELL / 2
                                    }, -12) rotate(-60)`}
                                    textAnchor="start"
                                >
                                    {axisLabel(player)}
                                </text>
                            );
                        })}

                        {rowIds.map((rowId, ri) => {
                            const player = byId.get(rowId)!;
                            const active =
                                rowId === hoveredRow || isModelActive(rowId);
                            return (
                                <text
                                    key={`row-${rowId}`}
                                    className="ipd-heatmap-label ipd-mono"
                                    data-active={active}
                                    style={
                                        player.kind === "llm"
                                            ? { fill: player.color }
                                            : undefined
                                    }
                                    x={-10}
                                    y={ri * CELL + CELL / 2}
                                    textAnchor="end"
                                    dominantBaseline="middle"
                                >
                                    {axisLabel(player)}
                                </text>
                            );
                        })}

                        {rowIds.map((rowId, ri) =>
                            colIds.map((colId, ci) => {
                                const value = cellValue(rowId, colId);
                                const dimmed = cellDimmed(rowId, colId);
                                const isSelf = rowId === colId;
                                const actorId = rowId;
                                const actor = byId.get(actorId)!;
                                const target = byId.get(colId)!;
                                return (
                                    <rect
                                        key={`${rowId}__${colId}`}
                                        className="ipd-heatmap-cell"
                                        data-dimmed={dimmed}
                                        data-self={isSelf}
                                        x={ci * CELL + 0.5}
                                        y={ri * CELL + 0.5}
                                        width={CELL - 1}
                                        height={CELL - 1}
                                        fill={coopFill(value)}
                                        onMouseEnter={(e) => {
                                            setHover({ rowId, colId, value });
                                            trackCell(e.currentTarget);
                                            onHighlight(actorId);
                                        }}
                                        onFocus={(e) => {
                                            setHover({ rowId, colId, value });
                                            trackCell(e.currentTarget);
                                            onHighlight(actorId);
                                        }}
                                        onBlur={clearHover}
                                        tabIndex={0}
                                        role="gridcell"
                                        aria-label={`${axisLabel(
                                            actor,
                                        )} vs ${axisLabel(
                                            target,
                                        )}: ${value.toFixed(3)}`}
                                    />
                                );
                            }),
                        )}

                        <g
                            transform={`translate(${
                                colIds.length * CELL + LEGEND_GAP
                            }, 0)`}
                        >
                            <defs>
                                <linearGradient
                                    id="ipd-coop-legend"
                                    x1="0"
                                    y1="1"
                                    x2="0"
                                    y2="0"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor={coopFill(0)}
                                    />
                                    <stop
                                        offset="50%"
                                        stopColor={coopFill(0.5)}
                                    />
                                    <stop
                                        offset="100%"
                                        stopColor={coopFill(1)}
                                    />
                                </linearGradient>
                            </defs>
                            <rect
                                x={0}
                                y={0}
                                width={LEGEND_W}
                                height={rowIds.length * CELL}
                                fill="url(#ipd-coop-legend)"
                                stroke="rgba(20, 18, 11, 0.12)"
                            />
                            <text
                                className="ipd-heatmap-legend-label ipd-mono"
                                x={LEGEND_W + 6}
                                y={4}
                            >
                                1
                            </text>
                            <text
                                className="ipd-heatmap-legend-label ipd-mono"
                                x={LEGEND_W + 6}
                                y={rowIds.length * CELL - 2}
                            >
                                0
                            </text>
                            <text
                                className="ipd-heatmap-legend-title ipd-mono"
                                transform={`translate(${
                                    LEGEND_W + 28
                                }, ${(rowIds.length * CELL) / 2}) rotate(90)`}
                                textAnchor="middle"
                            >
                                Cooperation
                            </text>
                        </g>
                    </g>
                </svg>

                {hover &&
                    hoverRowPlayer &&
                    hoverColPlayer &&
                    primaryFrom &&
                    primaryTo && (
                    <div
                        ref={cardRef}
                        className="ipd-hover-card ipd-mono ipd-heatmap-card"
                    >
                        <strong>
                            {primaryFrom.label}
                            <span className="ipd-heatmap-card-vs"> vs </span>
                            {primaryTo.label}
                        </strong>
                        <dl>
                            <dt>
                                {axisLabel(primaryFrom)} →{" "}
                                {axisLabel(primaryTo)}
                            </dt>
                            <dd>{hover.value.toFixed(3)}</dd>
                            {reverseValue != null &&
                                hover.rowId !== hover.colId && (
                                    <>
                                        <dt>
                                            {axisLabel(primaryTo)} →{" "}
                                            {axisLabel(primaryFrom)}
                                        </dt>
                                        <dd>{reverseValue.toFixed(3)}</dd>
                                    </>
                                )}
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
}
