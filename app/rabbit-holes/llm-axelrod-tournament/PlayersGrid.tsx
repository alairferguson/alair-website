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

/** Row-major into a 4-row × 2-col grid; the 8th cell is left empty. */
const CLASSICS = [
    "Tit For Tat",
    "GTFT",
    "Win-Stay Lose-Shift",
    "Grudger",
    "Cooperator",
    "Defector",
    "Random",
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
            <h4 className="ipd-players-title">The Players</h4>
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
                    </div>
                    <p className="ipd-players-caption ipd-mono">
                        LLM × Personas
                    </p>
                </div>

                <div className="ipd-players-classic">
                    <div
                        className="ipd-players-colhead ipd-mono ipd-players-spacer"
                        aria-hidden="true"
                    >
                        &nbsp;
                    </div>
                    <div className="ipd-players-classic-grid">
                        {CLASSICS.map((name) => (
                            <div
                                className="ipd-players-cell ipd-players-cell--hoverable"
                                key={name}
                            >
                                <PersonIcon color={CLASSIC_COLOR} />
                                <span className="ipd-players-tooltip">
                                    {name}
                                </span>
                            </div>
                        ))}
                        <div
                            className="ipd-players-cell ipd-players-classic-empty"
                            aria-hidden="true"
                        />
                    </div>
                    <p className="ipd-players-caption ipd-mono">Classics</p>
                </div>
            </div>
        </div>
    );
}
