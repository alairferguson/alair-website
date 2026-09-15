import type { Player, Report, Series } from "./types";

/**
 * Canonical plot colors for the LLM IPD report.
 * Applied on load so charts stay on-brand even if report.json is regenerated
 * with a different palette (e.g. the old GitHub-style purple for Haiku).
 *
 * Claude / Anthropic logo "Crail" burnt orange: #C15F3C
 * OpenAI blue kept as the contrasting LLM series color.
 *
 * The 5-model tournament (Claude Haiku 4.5, GPT-4o-mini, Gemini 3.1 Flash
 * Lite, Grok 4.1 Fast, Qwen 2.5 7B) is in; each has a deliberate, CVD-safe
 * color via the exact/family map below. Anything beyond these five falls
 * back to FALLBACK_LLM_COLORS, assigned deterministically (sorted by model
 * id, so assignment doesn't depend on report.json's array order) and stably
 * (a given model id always lands on the same slot across regenerations, as
 * long as the set of unrecognized models doesn't change).
 */
export const CLAUDE_COLOR = "#C15F3C";
export const OPENAI_COLOR = "#218BFF";
export const GEMINI_COLOR = "#1BAF7A";
export const GROK_COLOR = "#4A3AA7";
export const QWEN_COLOR = "#EDA100";
export const CLASSIC_COLOR = "#8B949E";

/** Exact model-id overrides (keys match report.json `model` / series `id`). */
export const LLM_MODEL_COLORS: Record<string, string> = {
    "claude-haiku-4-5": CLAUDE_COLOR,
    "gpt-4o-mini": OPENAI_COLOR,
    "gemini-3.1-flash-lite": GEMINI_COLOR,
    "grok-4-1-fast-non-reasoning": GROK_COLOR,
    "qwen2.5:7b": QWEN_COLOR,
};

/**
 * Colors for models that match neither an exact override nor a known family
 * regex, in assignment order. CVD-validated against the five colors above
 * (worst adjacent ΔE 76.8 in `oklch`, `dataviz` skill's validate_palette.js).
 */
const FALLBACK_LLM_COLORS = [
    "#E87BA4", // magenta
    "#0D366B", // deep blue
];

function familyColorForModelId(modelId: string): string | null {
    if (/claude|haiku|sonnet|opus/i.test(modelId)) return CLAUDE_COLOR;
    if (/gpt|openai|\bo[1-4]\b/i.test(modelId)) return OPENAI_COLOR;
    if (/gemini/i.test(modelId)) return GEMINI_COLOR;
    if (/grok/i.test(modelId)) return GROK_COLOR;
    if (/qwen/i.test(modelId)) return QWEN_COLOR;
    return null;
}

/** Stable fallback slot per unrecognized model id, sorted for determinism. */
function assignFallbackColors(modelIds: Iterable<string>): Map<string, string> {
    const unresolved = Array.from(new Set(modelIds))
        .filter((id) => !LLM_MODEL_COLORS[id] && !familyColorForModelId(id))
        .sort();
    const map = new Map<string, string>();
    unresolved.forEach((id, i) => {
        map.set(id, FALLBACK_LLM_COLORS[i % FALLBACK_LLM_COLORS.length]);
    });
    return map;
}

/**
 * Short display names for prose and graphs — the intro paragraph spells the
 * full model names out once, then every label after that (leaderboard,
 * hover cards, legends) uses these instead.
 */
export const MODEL_SHORT_NAMES: Record<string, string> = {
    "claude-haiku-4-5": "Claude",
    "gpt-4o-mini": "GPT",
    "gemini-3.1-flash-lite": "Gemini",
    "grok-4-1-fast-non-reasoning": "Grok",
    "qwen2.5:7b": "Qwen",
};

const PERSONA_DISPLAY_LABELS: Record<string, string> = {
    neutral: "Neutral",
    selfish: "Selfish",
    cooperative: "Cooperative",
    payoff_only: "Payoff-only",
};

/** Rewrite player + series labels to use the short model names above. */
export function withShortModelNames(report: Report): Report {
    function relabelPlayer(player: Player): Player {
        if (player.kind !== "llm") return player;
        const short = player.model ? MODEL_SHORT_NAMES[player.model] : null;
        if (!short) return player;
        const personaLabel = player.persona
            ? (PERSONA_DISPLAY_LABELS[player.persona] ?? player.persona)
            : "";
        return {
            ...player,
            label: `${short}: ${personaLabel} prompt`,
            shortLabel: `${short} · ${personaLabel}`,
        };
    }

    function relabelSeries(series: Series): Series {
        const short = MODEL_SHORT_NAMES[series.id];
        return short ? { ...series, label: short } : series;
    }

    return {
        ...report,
        players: report.players.map(relabelPlayer),
        series: report.series.map(relabelSeries),
    };
}

/** Remap player + series colors to the site palette. */
export function withCanonicalColors(report: Report): Report {
    const modelIds = report.players
        .map((p) => p.model)
        .filter((m): m is string => Boolean(m));
    const fallback = assignFallbackColors(modelIds);

    function colorForModelId(modelId: string | null | undefined): string | null {
        if (!modelId) return null;
        return (
            LLM_MODEL_COLORS[modelId] ??
            familyColorForModelId(modelId) ??
            fallback.get(modelId) ??
            null
        );
    }

    function resolvePlayerColor(player: Player): string {
        if (player.kind === "classic") return CLASSIC_COLOR;
        return colorForModelId(player.model) ?? player.color;
    }

    function resolveSeriesColor(series: Series): string {
        return colorForModelId(series.id) ?? series.color;
    }

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
