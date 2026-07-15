/**
 * Editorial copy for the report's prose sections. Paragraphs wrapped in
 * [brackets] are drafting notes, not finished text — ProseSection renders
 * them in a visibly distinct "draft" style. Replace the bracketed text with
 * real prose and the section reflows into normal body copy automatically.
 */

export type ProseCopy = {
    title: string;
    dek?: string;
    paragraphs: string[];
    list?: string[];
};

export const INTRODUCTION: ProseCopy = {
    title: "Introduction",
    paragraphs: [
        "When a language model plays the iterated prisoner's dilemma, the interesting question isn't whether it wins the tournament — it's how it plays. This project runs a round-robin Axelrod tournament pairing curated classic strategies against one or more LLM players, then asks a different question of the result: what is this model's behavioral profile, and which classic strategy does it most resemble?",
        "Axelrod's own analysis of the original tournaments identified niceness, forgiveness, retaliation, and provocability as the traits that separated the winners from the rest. Those four dimensions, plus overall cooperation rate, form the fingerprint used throughout this report — a five-number behavioral signature computed from the recorded move histories of every player, LLM and classic alike.",
        "What follows: a strategy-space plot placing every player by two fingerprint dimensions at a time, a leaderboard ranked by outcome, and — for each LLM — its nearest classic strategy under a standardized probe battery. A persona side-experiment then asks how much a system-prompt disposition can shift that fingerprint for the same underlying model.",
    ],
};

export const METHODOLOGY: ProseCopy = {
    title: "Methodology",
    dek: "How the tournament was run, and how fairness was enforced by construction.",
    paragraphs: [
        "[Describe the round-robin setup: the classic reference strategies, the LLM × persona variants, turns per match, repetitions, and the payoff matrix used.]",
        "[Explain the three fairness safeguards and what each rules out: per-match statelessness, moves-only prompts (no opponent identity), and temperature=0 determinism for the main runs.]",
        "[Explain the probe method used to find each player's nearest classic strategy: the standardized opponent battery and normalized Hamming distance, and why this controls for opponent-elicited variation in the raw histories.]",
    ],
};

export const DISCUSSION: ProseCopy = {
    title: "Discussion",
    paragraphs: [
        "[Interpret the strategy-space plot: where do the LLM × persona points fall relative to the classics, and what does that placement mean behaviorally?]",
        "[Discuss the persona knob results — how much does a system-prompt disposition shift move the fingerprint of the same underlying model?]",
        "[Discuss any notable cross-model differences, and anything that ran counter to expectation going in.]",
    ],
};

export const LIMITATIONS: ProseCopy = {
    title: "Limitations",
    paragraphs: [
        "[Note the core epistemic limitation: an LLM may not be a single deterministic strategy in Axelrod's sense. temperature=0 plus the paraphrase side-experiment is the mitigation here, not a full resolution.]",
    ],
    list: [
        "[Scope cut — fine-tuning / LoRA: the disposition question is answered via prompting (the persona knob), not gradient updates.]",
        "[Scope cut — leakage into unrelated tasks: out of scope, a different project.]",
        "[Scope cut — full (T, S) game-grid sweep across Stag Hunt / Chicken / Harmony: a natural v2.]",
        "[Known refinement — label de-overlap on the strategy-space plot when many players cluster.]",
    ],
};

export const CONCLUSION: ProseCopy = {
    title: "Conclusion",
    paragraphs: [
        "[Restate the core finding in one or two sentences — what is this model's behavioral profile, in plain terms?]",
        "[Point to the natural next step: the (T, S) sweep, more models, or a repulsion layout for the figure.]",
    ],
};

export const CREDITS = {
    paragraphs: [
        "Built on Axelrod-Python (Knight et al., Journal of Open Research Software, 2016).",
    ],
};
