import type { Player, Report, Series } from "./types";

/**
 * Canonical plot colors for the LLM IPD report.
 * Applied on load so charts stay on-brand even if report.json is regenerated
 * with a different palette (e.g. the old GitHub-style purple for Haiku).
 *
 * Claude / Anthropic logo "Crail" burnt orange: #C15F3C
 * OpenAI blue kept as the contrasting LLM series color.
 */
export const CLAUDE_COLOR = "#C15F3C";
export const OPENAI_COLOR = "#218BFF";
export const CLASSIC_COLOR = "#8B949E";

/** Exact model-id overrides (keys match report.json `model` / series `id`). */
export const LLM_MODEL_COLORS: Record<string, string> = {
    "claude-haiku-4-5": CLAUDE_COLOR,
    "gpt-4o-mini": OPENAI_COLOR,
};

function colorForModelId(modelId: string | null | undefined): string | null {
    if (!modelId) return null;
    const exact = LLM_MODEL_COLORS[modelId];
    if (exact) return exact;
    if (/claude|haiku|sonnet|opus/i.test(modelId)) return CLAUDE_COLOR;
    if (/gpt|openai|\bo[1-4]\b/i.test(modelId)) return OPENAI_COLOR;
    return null;
}

export function resolvePlayerColor(player: Player): string {
    if (player.kind === "classic") return CLASSIC_COLOR;
    return colorForModelId(player.model) ?? player.color;
}

export function resolveSeriesColor(series: Series): string {
    return colorForModelId(series.id) ?? series.color;
}

/** Remap player + series colors to the site palette. */
export function withCanonicalColors(report: Report): Report {
    return {
        ...report,
        players: report.players.map((player) => ({
            ...player,
            color: resolvePlayerColor(player),
        })),
        series: report.series.map((series) => ({
            ...series,
            color: resolveSeriesColor(series),
        })),
    };
}
