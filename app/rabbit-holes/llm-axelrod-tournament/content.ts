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
        "Behavioral economics has long sought to distill rational behavior into mathematical fact. Game theory rises from this tradition, and at an increasingly exponential rate, the rationality proposed by this discipline can be tested by repeated simulations. Artificial Intelligence brings with it exciting possibilities of real-world-simulated tests to explore the differences behind mathematically rational behavior and the decisions that humans (or rather simulated humans) make.",
        "This project simulates an Axelrod tournament in which a set of players faces one another in multiple Iterated Prisoner’s Dilemma games. Axelrod’s tournaments have a rich history in economics, and if you are unfamiliar, I highly recommend that you peruse [this write-up](https://egtheory.wordpress.com/2015/03/02/ipd/). While [past](https://edwardbrookman.substack.com/p/ai-evolves-a-winning-strategy-in?r=2pe9fn) work has sought to explore whether or not LLMs can *win*, I seek to understand *how they play*.",
        "[Axelrod’s analyses of the original 1980 tournament](https://www.jstor.org/stable/173932) identified niceness, forgiveness, retaliation, and provocability as the traits that separated the winners from the rest. My analysis adds the cooperation rate of a strategy to characterize play in this project. These five traits form the behavioral fingerprint of the player.",
        "What follows: overview of how the tournament was run, a strategy-space plot comparing players across the traits of the behavioral fingerprint, a leaderboard ranked by outcome, and each LLM player’s nearest classic strategy under a standardized probe battery. I conclude by discussing the main takeaway: prompting choices make the largest difference in how LLM players strategize.",
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
