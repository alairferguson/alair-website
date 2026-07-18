"use client";

import { useMemo, useState } from "react";
import type { Player, Report } from "./types";

type ViewMode = "llm-classic" | "llm-llm" | "full";

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

const CELL = 34;
const LABEL_W = 132;
const LABEL_H = 120;
const LEGEND_W = 14;
const LEGEND_GAP = 20;
const PAD = { top: 10, right: 14, bottom: 12, left: 10 };

/** Sequential ink → burgundy scale matching the report accent. */
function coopFill(v: number): string {
    const t = Math.max(0, Math.min(1, v));
    // Keep the low end a touch darker than pure white so empty cells still read.
    const l = 92 - t * 58;
    const c = 4 + t * 46;
    const h = 350 - t * 8;
    return `oklch(${l.toFixed(1)}% ${c.toFixed(1)}% ${h.toFixed(0)})`;
}

function compactModel(model: string | null): string {
    if (!model) return "llm";
    if (model.includes("gpt-4o-mini")) return "4o-mini";
    if (model.includes("haiku")) return "haiku";
    return model;
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

function axisLabel(player: Player): string {
    if (player.kind === "llm") {
        return `${compactModel(player.model)} · ${compactPersona(player.persona)}`;
    }
    return CLASSIC_SHORT[player.label] ?? player.label;
}

export default function CooperationHeatmap({
    report,
    highlightedId,
    onHighlight,
}: Props) {
    const [view, setView] = useState<ViewMode>("llm-classic");
    const [hover, setHover] = useState<HoverCell | null>(null);

    const byId = useMemo(() => {
        const map = new Map<string, Player>();
        for (const player of report.players) map.set(player.id, player);
        return map;
    }, [report.players]);

    const { rowIds, colIds } = useMemo(() => {
        const order = report.cooperationMatrix.players.filter((id) =>
            byId.has(id),
        );
        const llms = order.filter((id) => byId.get(id)?.kind === "llm");
        const classics = order.filter((id) => byId.get(id)?.kind === "classic");

        if (view === "llm-classic") {
            return { rowIds: llms, colIds: classics };
        }
        if (view === "llm-llm") {
            return { rowIds: llms, colIds: llms };
        }
        return { rowIds: order, colIds: order };
    }, [report.cooperationMatrix.players, byId, view]);

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

    const hoveredRow = hover?.rowId ?? null;
    const hoveredCol = hover?.colId ?? null;
    const activeId = highlightedId;

    function cellDimmed(rowId: string, colId: string): boolean {
        if (hover) {
            return rowId !== hover.rowId && colId !== hover.colId;
        }
        if (activeId) {
            return rowId !== activeId && colId !== activeId;
        }
        return false;
    }

    function clearHover() {
        setHover(null);
    }

    const hoverRowPlayer = hover ? byId.get(hover.rowId) : null;
    const hoverColPlayer = hover ? byId.get(hover.colId) : null;
    const reverseValue =
        hover != null ? (values[hover.colId]?.[hover.rowId] ?? null) : null;

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
                </div>
            </div>

            <div
                className="ipd-heatmap"
                onMouseLeave={() => {
                    clearHover();
                    onHighlight(null);
                }}
            >
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    style={{ minWidth: width }}
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
                                colId === hoveredCol || colId === activeId;
                            return (
                                <text
                                    key={`col-${colId}`}
                                    className="ipd-heatmap-label ipd-mono"
                                    data-active={active}
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
                                rowId === hoveredRow || rowId === activeId;
                            return (
                                <text
                                    key={`row-${rowId}`}
                                    className="ipd-heatmap-label ipd-mono"
                                    data-active={active}
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
                                const value = values[rowId]?.[colId] ?? 0;
                                const dimmed = cellDimmed(rowId, colId);
                                const isSelf = rowId === colId;
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
                                        onMouseEnter={() => {
                                            setHover({ rowId, colId, value });
                                            onHighlight(rowId);
                                        }}
                                        onFocus={() => {
                                            setHover({ rowId, colId, value });
                                            onHighlight(rowId);
                                        }}
                                        onBlur={clearHover}
                                        tabIndex={0}
                                        role="gridcell"
                                        aria-label={`${axisLabel(
                                            byId.get(rowId)!,
                                        )} vs ${axisLabel(
                                            byId.get(colId)!,
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

                {hover && hoverRowPlayer && hoverColPlayer && (
                    <div className="ipd-hover-card ipd-mono ipd-heatmap-card">
                        <strong>
                            {hoverRowPlayer.label}
                            <span className="ipd-heatmap-card-vs"> vs </span>
                            {hoverColPlayer.label}
                        </strong>
                        <dl>
                            <dt>Row → col</dt>
                            <dd>{hover.value.toFixed(3)}</dd>
                            {reverseValue != null &&
                                hover.rowId !== hover.colId && (
                                    <>
                                        <dt>Col → row</dt>
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
