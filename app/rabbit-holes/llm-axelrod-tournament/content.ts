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

export type MethodologySubsection = {
    id: string;
    heading: string;
    paragraphs: string[];
    list?: string[];
    /** Index of the paragraph after which a full-width slot (chart, card grid) is inserted. */
    slotAfterParagraph?: number;
};

export type MethodologyCopy = {
    title: string;
    dek?: string;
    subsections: MethodologySubsection[];
};

export const INTRODUCTION: ProseCopy = {
    title: "Introduction",
    paragraphs: [
        "Game theory has long sought to formalize rational decision-making into mathematical concreteness, and as compute increases at a seemingly exponential rate, the rationality proposed by this discipline can be tested by repeated simulations. Artificial Intelligence brings with it exciting possibilities of simulated tests to explore the differences between mathematically rational behavior and the decisions that simulated humans make.",
        "This project simulates an Axelrod tournament in which a set of players faces one another in multiple Iterated Prisoner’s Dilemma games. Axelrod’s tournaments have a rich history in economics, and if you are unfamiliar, I highly recommend that you peruse [this write-up](https://egtheory.wordpress.com/2015/03/02/ipd/). While [past](https://edwardbrookman.substack.com/p/ai-evolves-a-winning-strategy-in?r=2pe9fn) work has sought to explore whether or not LLMs can *win*, I seek to understand *how LLMs play*.",
        "[Axelrod’s analyses of the original 1980 tournament](https://www.jstor.org/stable/173932) identified niceness, forgiveness, retaliation, and provocability as the traits that separated the winners from the rest. My analysis adds the cooperation rate of a strategy to characterize play in this project. These five traits form the behavioral fingerprint of the player.",
        "What follows: overview of how the tournament was run, a strategy-space plot comparing players across the traits of the behavioral fingerprint, a leaderboard ranked by outcome, and each LLM player’s nearest classic strategy. I conclude by discussing the main takeaway: prompting choices make the largest difference in how LLM players strategize.",
    ],
};

export const METHODOLOGY: MethodologyCopy = {
    title: "Methodology",
    dek: "How the tournament was run, and how fairness was enforced by construction.",
    subsections: [
        {
            id: "the-game",
            heading: "The Game",
            paragraphs: [
                "Imagine for a moment that you and a sharp, quick-witted accomplice plan and execute an elaborate heist. A year later, thinking you got away with your crime, you see flashing lights and a smug detective reads you your Miranda Rights as she shoves you into the back of her squad car. Next to you is a face you thought you’d never see again: your partner-in-crime is eyeing you with a glint of mistrust in their eye. Unease sets in. They take you to separate interrogation rooms, lay out the damning evidence, and explain very clearly what will happen if you confess. If you and your partner both stay silent, you will both face ten years in prison. If you or your partner confess and the other stays silent, the one who confesses will walk without serving time, while the other will face a double sentence. If you both confess, you will both serve five years in prison. You remember that look of doubt in your partner’s eyes in the back of the car… what do you do? Confess or hold your silence?",
            ],
        },
        {
            id: "the-tournament",
            heading: "The Tournament",
            paragraphs: [
                "In an Axelrod tournament, we play an iterated version of the above Prisoner’s Dilemma. In one game of the tournament, Player A and Player B are presented with the following payoff matrix:",
                "Each round, Player A and Player B choose to Cooperate or Defect simultaneously, without seeing the other's move; this repeats for 30 rounds per game. This tournament has 15 players (7 classic strategies and 8 LLM × personas), and each plays each other 5 times, for a total of 70 games.",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "classic-strategy-players",
            heading: "Classic Strategy Players",
            paragraphs: [
                "In Axelrod’s original and subsequent tournaments, players submitted their chosen strategies ahead of time and the tournament ran on these fixed instructions. Of those that have proven the strongest over time, seven classic strategies were selected as players for this simulation:",
            ],
            list: [
                "**Tit For Tat:** Cooperates on the first move, then mirrors whatever the opponent played the turn before. Famously hard to beat.",
                "**GTFT (Generous Tit For Tat):** Plays Tit For Tat’s mirroring rule, but occasionally cooperates anyway after an opponent’s defection.",
                "**Win-Stay Lose-Shift:** Repeats its last move if that move scored well, and switches otherwise.",
                "**Grudger:** Cooperates until the opponent defects once, then defects for the rest of the match.",
                "**Cooperator:** Always cooperates, regardless of what the opponent does. A baseline for pure niceness.",
                "**Defector:** Always defects, regardless of what the opponent does. A baseline for pure self-interest.",
                "**Random (0.5):** Cooperates or defects with equal probability each turn, independent of history. A noise baseline against which genuine strategy can be measured.",
            ],
        },
        {
            id: "llm-persona-players",
            heading: "LLM × Persona Players",
            paragraphs: [
              "I used Claude Haiku 4.5 and GPT-4o-mini as the two models in this tournament. Each was presented the game through four system-prompt personas: selfish, cooperative, payoff-only, and neutral. See the [Appendix](#appendix-system-prompts) for how each prompt was phrased. Crossing two models with four personas produced the 8 LLM × persona players in the tournament:",
            ],
            list: [
                "**Claude Haiku 4.5 × selfish**",
                "**Claude Haiku 4.5 × cooperative**",
                "**Claude Haiku 4.5 × payoff-only**",
                "**Claude Haiku 4.5 × neutral**",
                "**GPT-4o-mini × selfish**",
                "**GPT-4o-mini × cooperative**",
                "**GPT-4o-mini × payoff-only**",
                "**GPT-4o-mini × neutral**",
            ],
        },
        {
            id: "fairness-safeguards",
            heading: "Fairness Safeguards",
            paragraphs: [
                "Three constraints keep the comparison between LLM players and classic strategies fair by construction, rather than by adjustment after the fact:",
            ],
            list: [
                "**Per-match statelessness:** every match starts with no memory of any other match. A player's move in one game can't be informed by what happened in a previous game against a different opponent, so each match tests the fresh strategy, as Axelrod's original tournament format assumes.",
                "**Moves-only prompts:** LLM players are never told who they're playing. Each turn's prompt shows only the payoff matrix and the sequence of C/D moves exchanged so far: no model name, no persona label, no reputation. This rules out an LLM shifting its play because it recognizes or guesses its opponent, rather than because of what that opponent has actually done.",
                "**Temperature = 0:** for the main runs, LLM players sample at temperature 0, so a given match history always produces the same next move. This is what makes the comparison to a classic strategy meaningful in the first place. Both are treated as deterministic functions from history to move, not as a distribution over moves.",
            ],
        },
        {
            id: "llms-nearest-classic-strategy",
            heading: "LLMs’ Nearest Classic Strategy",
            paragraphs: [
               "Each player's behavioral fingerprint (cooperation rate, niceness, retaliation, forgiveness, and provocability) is computed from its actual moves across all 70 round-robin matches, the same fingerprint plotted in the strategy-space figure below. To find an LLM × persona player's nearest classic strategy, I take the Euclidean distance between its fingerprint and every classic strategy's fingerprint in that same five-dimensional space, and report the closest match.",
                "A short distance means an LLM's aggregate behavior (how often it cooperates, how it opens, how sharply it punishes and how readily it forgives) statistically resembles a classic strategy's. It does not mean the LLM is internally running that strategy's exact rule; see Limitations for more on this distinction.",
            ],
            slotAfterParagraph: 0,
        },
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

export type PersonaPrompt = {
    id: string;
    label: string;
    systemPrompt: string;
};

export const APPENDIX: ProseCopy = {
    title: "Appendix",
    dek: "Full prompt text for each persona.",
    paragraphs: [
        "Each LLM player receives a system prompt that sets its disposition (below) and, every turn, a user prompt built from the live payoff matrix and this match's move history only — the same information a classic strategy can see, and nothing about who the opponent is (see Fairness Safeguards). Three of the four personas share an identical output format around a different disposition paragraph; payoff-only goes further and strips the Cooperate/Defect framing entirely, presenting the same game as a bare choice between A and B.",
    ],
};

export const PERSONA_PROMPTS: PersonaPrompt[] = [
    {
        id: "neutral",
        label: "Neutral",
        systemPrompt:
            "You are playing a repeated Prisoner's Dilemma. Each round choose Cooperate (C) or Defect (D). You will see the payoff table and this match's move history.\nOutput rules (strict):\n  - Reply with exactly one character: C or D\n  - No explanation, punctuation, or other text",
    },
    {
        id: "selfish",
        label: "Selfish",
        systemPrompt:
            "You are a ruthless, self-interested agent. Your only goal is to maximize your own score, with no regard for the other player. Each round choose Cooperate (C) or Defect (D). You will see the payoff table and this match's move history.\nOutput rules (strict):\n  - Reply with exactly one character: C or D\n  - No explanation, punctuation, or other text",
    },
    {
        id: "cooperative",
        label: "Cooperative",
        systemPrompt:
            "You are a fair-minded agent who values mutual benefit and long-term trust. Each round choose Cooperate (C) or Defect (D). You will see the payoff table and this match's move history.\nOutput rules (strict):\n  - Reply with exactly one character: C or D\n  - No explanation, punctuation, or other text",
    },
    {
        id: "payoff_only",
        label: "Payoff-only",
        systemPrompt:
            "You are playing a repeated two-player game. Each round you choose action A or action B. You will see a payoff table and this match's choice history. Maximize your own total points.\nOutput rules (strict):\n  - Reply with exactly one character: A or B\n  - No explanation, punctuation, or other text",
    },
];

export const USER_PROMPT_EXAMPLES: Array<{
    id: string;
    label: string;
    body: string;
}> = [
    {
        id: "cd",
        label: "Neutral · Selfish · Cooperative (C/D)",
        body: "Payoffs each round (your_move, their_move) -> your_points:\n  (C, C) -> 3    (you cooperate, they cooperate)\n  (C, D) -> 0    (you cooperate, they defect)\n  (D, C) -> 5    (you defect, they cooperate)\n  (D, D) -> 1    (you defect, they defect)\n\nHistory so far:\n  Round 1: you played C, they played C\n  Round 2: you played C, they played D\n  Round 3: you played D, they played D\n\nYour move this round (reply with ONLY C or D, no other text):",
    },
    {
        id: "ab",
        label: "Payoff-only (A/B)",
        body: "Payoffs each round (your choice, their choice) -> your_points:\n  (A, A) -> 3\n  (A, B) -> 0\n  (B, A) -> 5\n  (B, B) -> 1\n\nHistory so far:\n  Round 1: you chose A, they chose A\n  Round 2: you chose A, they chose B\n  Round 3: you chose B, they chose B\n\nYour move this round (reply with ONLY A or B, no other text):",
    },
];
