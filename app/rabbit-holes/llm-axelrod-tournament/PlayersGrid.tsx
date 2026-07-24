import { CLASSIC_COLOR, LLM_MODEL_COLORS } from "./colors";

const MODELS: Array<{ id: string; label: string; full: string }> = [
    { id: "claude-haiku-4-5", label: "Claude", full: "Claude Haiku 4.5" },
    { id: "gpt-4o-mini", label: "GPT-4o-mini", full: "GPT-4o-mini" },
    { id: "gemini-3.1-flash-lite", label: "Gemini", full: "Gemini 3.1 Flash Lite" },
    { id: "grok-4-1-fast-non-reasoning", label: "Grok", full: "Grok 4.1 Fast (non-reasoning)" },
    { id: "qwen2.5:7b", label: "Qwen", full: "Qwen 2.5 7B" },
];

const PERSONAS: Array<{ short: string; full: string }> = [
    { short: "Neut", full: "Neutral" },
    { short: "Self", full: "Selfish" },
    { short: "Coop", full: "Cooperative" },
    { short: "Payoff", full: "Payoff-only" },
];

/**
 * Explicit 5-row × 2-col placement (row-major, left to right, top to
 * bottom). `null` marks an empty cell. Defector sits alone in column 1's
 * last row so column 1 fills completely instead of leaving a dangling
 * empty row.
 */
const CLASSIC_SLOTS: Array<string | null> = [
    "Tit For Tat", "GTFT",
    "Win-Stay Lose-Shift", "Grudger",
    "Cooperator", null,
    "Random", null,
    "Defector", null,
];

function PersonIcon({ color }: { color: string }) {
    return (
        <svg
            className="ipd-players-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="4" fill={color} />
            <path d="M3.5 23a8.5 8.5 0 0 1 17 0z" fill={color} />
        </svg>
    );
}

export default function PlayersGrid() {
    return (
        <div className="ipd-players-wrap">
            <div className="ipd-players-groups">
                <div className="ipd-players-llm">
                    <div className="ipd-players-llm-grid">
                        <div aria-hidden="true" />
                        {PERSONAS.map((persona) => (
                            <div
                                className="ipd-players-colhead ipd-mono"
                                key={persona.short}
                            >
                                {persona.short}
                            </div>
                        ))}
                        {MODELS.map((model) => (
                            <div className="ipd-players-row" key={model.id}>
                                <div className="ipd-players-rowhead ipd-mono">
                                    {model.label}
                                </div>
                                {PERSONAS.map((persona) => (
                                    <div
                                        className="ipd-players-cell"
                                        key={persona.short}
                                        title={`${model.full} × ${persona.full}`}
                                    >
                                        <PersonIcon
                                            color={LLM_MODEL_COLORS[model.id]}
                                        />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <p className="ipd-players-caption ipd-players-llm-caption ipd-mono">
                            LLM × Personas
                        </p>
                    </div>
                </div>

                <div className="ipd-players-classic">
                    <div
                        className="ipd-players-colhead ipd-mono ipd-players-spacer"
                        aria-hidden="true"
                    >
                        &nbsp;
                    </div>
                    <div className="ipd-players-classic-grid">
                        {CLASSIC_SLOTS.map((name, i) =>
                            name ? (
                                <div
                                    className="ipd-players-cell ipd-players-cell--hoverable"
                                    key={name}
                                >
                                    <PersonIcon color={CLASSIC_COLOR} />
                                    <span className="ipd-players-tooltip ipd-mono">
                                        {name}
                                    </span>
                                </div>
                            ) : (
                                <div
                                    className="ipd-players-cell ipd-players-classic-empty"
                                    key={`empty-${i}`}
                                    aria-hidden="true"
                                />
                            ),
                        )}
                    </div>
                    <p className="ipd-players-caption ipd-mono">Classics</p>
                </div>
            </div>
        </div>
    );
}
