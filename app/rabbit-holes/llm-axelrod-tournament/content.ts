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

export type SlottedSubsection = {
    id: string;
    /** Omit to render the subsection as an unheaded prose block. */
    heading?: string;
    paragraphs: string[];
    list?: string[];
    /**
     * Paragraph index (or indices) after which a full-width slot is inserted.
     * Pair with a matching single slot node or array of nodes in SlottedSection.
     */
    slotAfterParagraph?: number | number[];
};

export type SlottedCopy = {
    title: string;
    dek?: string;
    subsections: SlottedSubsection[];
};

export const INTRODUCTION: ProseCopy = {
    title: "Introduction",
    paragraphs: [
        "Game theory has long sought to formalize rational decision-making into mathematical concreteness, and as compute increases at a seemingly exponential rate, the rationality proposed by this discipline can be tested by repeated simulations. Artificial Intelligence brings with it exciting possibilities of simulated tests to explore the differences between mathematically rational behavior and the decisions that simulated humans make.",
        "This project simulates an Axelrod tournament in which a set of players faces one another in multiple Iterated Prisoner’s Dilemma games. Axelrod’s tournaments have a rich history in economics, and if you are unfamiliar, I highly recommend that you peruse [this write-up](https://egtheory.wordpress.com/2015/03/02/ipd/). While [past](https://edwardbrookman.substack.com/p/ai-evolves-a-winning-strategy-in?r=2pe9fn) work has sought to explore whether or not LLMs can *win*, I seek to understand *how LLMs play*.",
        "[Axelrod’s analyses of the original 1980 tournament](https://www.jstor.org/stable/173932) identified niceness, forgiveness, retaliation, and provocability as the traits that separated the winners from the rest. My analysis adds the cooperation of a strategy to characterize play in this project. These five traits form the behavioral fingerprint of the player.",
        "What follows: a leaderboard ranked by outcome, a strategy-space plot comparing players across the traits of the behavioral fingerprint, and a cooperation matrix of who cooperates with whom. I conclude by discussing the main takeaway: prompting choices make the largest difference in how LLM players strategize.",
    ],
};

export const METHODOLOGY: SlottedCopy = {
    title: "Methodology",
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
                "Each round, Player A and Player B choose to Cooperate or Defect simultaneously, without seeing the other's move; this repeats for 30 rounds per game. This tournament has 27 players (7 classic strategies and 20 LLM × personas), and each plays each other 5 times, for a total of 130 games.",
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
              "I used five models in this tournament: Claude Haiku 4.5, GPT-4o-mini, Gemini 3.1 Flash Lite, Grok 4.1 Fast (non-reasoning), and Qwen 2.5 7B. Each was presented the game through four system-prompt personas: selfish, cooperative, payoff-only, and neutral. See the [Appendix](#appendix-system-prompts) for how each prompt was phrased. Crossing five models with four personas produced the 20 LLM × persona players in the tournament:",
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
                "**Gemini 3.1 Flash Lite × selfish**",
                "**Gemini 3.1 Flash Lite × cooperative**",
                "**Gemini 3.1 Flash Lite × payoff-only**",
                "**Gemini 3.1 Flash Lite × neutral**",
                "**Grok 4.1 Fast (non-reasoning) × selfish**",
                "**Grok 4.1 Fast (non-reasoning) × cooperative**",
                "**Grok 4.1 Fast (non-reasoning) × payoff-only**",
                "**Grok 4.1 Fast (non-reasoning) × neutral**",
                "**Qwen 2.5 7B × selfish**",
                "**Qwen 2.5 7B × cooperative**",
                "**Qwen 2.5 7B × payoff-only**",
                "**Qwen 2.5 7B × neutral**",
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
                "Each player's behavioral fingerprint (cooperation, niceness, retaliation, forgiveness, and provocability) is computed from its actual moves across all 130 round-robin matches. These fingerprints are plotted in the [strategy-space figure below](#strategy-space).",
                "To find an LLM × persona player's nearest classic strategy, I take the Euclidean distance between its fingerprint and every classic strategy's fingerprint in that same five-dimensional space, and report the closest match.",
                "A short distance means an LLM's aggregate behavior (how often it cooperates, how it opens, how sharply it punishes and how readily it forgives) statistically resembles a classic strategy's. It does not mean the LLM is internally running that strategy's exact rule; see Limitations for more on this distinction.",
            ],
            slotAfterParagraph: 0,
        },
    ],
};

export const RESULTS: SlottedCopy = {
    title: "Results",
    subsections: [
        {
            id: "leaderboard",
            heading: "Leaderboard",
            paragraphs: [
                "The Leaderboard shows the overall results for each player in the tournament and is ranked by outcome (mean score per turn). The table also presents mean score per turn, total wins, the five fingerprint dimensions, and for LLM players, their nearest classic strategy.",
                "It is worth noting that “wins” and “rank” counterintuitively pull in opposite directions. A win is earned by out-scoring one opponent in a match, which “Defectors” do consistently by exploiting the nicer players. Rank reflects points scored per turn, and mutually cooperating for 30 rounds at 3 points each results in more points than winning head-to-head match ups.",
                "The classic strategy Grudger won the tournament. Of the LLM × personas, Grok 4.1 Fast (non-reasoning) won the highest mean score per turn. By model, no clear pattern arises. However, by persona, neutral personas win, followed by cooperative personas, and the selfish and payoff-only strategies rank worst. The behavior of players on the axes of model and persona is further explored in the [Strategy Space](#strategy-space).",
                "Among the seven classic strategies, the ranking doesn't reproduce Axelrod's original result. Grudger takes first place overall, while Tit For Tat (the strategy that won both of Axelrod's actual 1980 round-robin tournaments) places seventh, behind five of the twenty LLM × persona players. GTFT and Win-Stay Lose-Shift rank further down, Cooperator lands lower still, and Defector and Random anchor the bottom of the entire field, Defector included, despite Defector winning more individual matches (95 of 130) than any other player in the tournament. This reversal reflects a more forgiving field than Axelrod's original: none of this tournament's players ever probes with an isolated defection and then returns to cooperation, so Grudger's lack of forgiveness is never put to the test.",
            ],
            slotAfterParagraph: 1,
        },
        {
            id: "strategy-space",
            heading: "Strategy Space",
            paragraphs: [
                "The Strategy Space figure below plots two of the five fingerprint dimensions at a time. In [Behavior](#strategy-space:behavior), forgiveness and cooperation are plotted. In [Punishment](#strategy-space:punishment), forgiveness and retaliation are plotted. In [Outcome](#strategy-space:outcome), score per turn and cooperation are plotted. To play around with the data, see the [Custom axes](#strategy-space:custom) below.",
                "## [Behavior](#:behavior)",
                "The first noteworthy takeaway is that, similar to the rankings, the LLM × persona points are not scattered: **they cluster together by persona**. The neutral personas group near Grudger, the selfish/payoff-only group near Defector, and Cooperative groups near Tit for Tat and GTFT.",
                "## [Punishment](#:punishment)",
                "Only the cooperative persona forgives. Payoff-only, neutral, and selfish personas all punish defection severely.",
                "## [Outcome](#:outcome)",
                "The neutral personas play best, then the cooperative personas, then payoff-only, and selfish plays the worst.",
                "Considering the Leaderboard's rankings and the three Strategy Space plots together, the pattern becomes clear: personas (prompting) affect behavior far more than model differences do. Exploration of this finding continues with the [Persona Slope figure](#persona-slope) in the Discussion section.",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "cooperation-matrix",
            heading: "Cooperation Matrix",
            paragraphs: [
                "We turn our attention now to the responsiveness of players' strategies to their opponent, to investigate whether players adapt to their simulated environment or if their play is fixed. I focus on the LLMs × Classics matrix, but there are interesting patterns to explore in the LLMs × LLMs and Full matrix tabs as well. Each cell below is how often the row player cooperated with the column player. If LLM × persona players had fixed strategies, there would be no within-row variation.",
                "We begin with the map sorted by model. Though the strategies are consistent, they are not fixed. For example, in the first row, GPT-4o-mini · neutral reaches near 100% cooperation with Tit for Tat, Grudger, Win-Stay Lose-Shift, GTFT, and Cooperator, but cooperates just 3.3% of the time with Defector and 34.7% of the time with Random.",
                "Once again, when we instead view this table sorted [by persona](#cooperation-matrix:persona), it becomes clear that the model personas are a far better predictor of play than models themselves. There is one notable exception: Qwen 2.5 7B–payoff-only. The anomaly is discussed in [Cross-Model Differences and Surprises](#cross-model-surprises).",
            ],
            slotAfterParagraph: 0,
        },
    ],
};

export const DISCUSSION: SlottedCopy = {
    title: "Discussion",
    subsections: [
        {
            id: "the-persona-knob",
            heading: "The Persona Knob",
            paragraphs: [
                "The Persona Slope figure below plots one fingerprint metric at a time against the four prompt personas, with model shown by color. Toggle through cooperation, niceness, retaliation, forgiveness, and provocability to see how each persona affects the behavior of the players.",
                "Cooperation and niceness barely separate the five models. [Niceness](#persona-slope:niceness) is close to a binary switch with scores of 1.0 for cooperative and neutral and 0.0 for payoff-only and selfish in every model but one. [Cooperation](#persona-slope:cooperation_rate) follows the same split, clustering around 0.57–0.6 for cooperative/neutral and near zero for payoff-only/selfish.",
                "[Retaliation](#persona-slope:retaliation) is high and stable at or above 0.93 for every persona and every model, with one exception. GPT-4o-mini's cooperative persona drops to 0.57, the one case where a model visibly tempers its punishment when told to value trust.",
                "[Forgiveness](#persona-slope:forgiveness) is where the models actually separate. For the cooperative personas, forgiveness ranges from 0.05 (Grok) to 1.0 (GPT-4o-mini). Two models, Grok and Qwen, barely change their strategies when prompted to be \"cooperative\" compared with other personas: their forgiveness stays under 0.15, indistinguishable from their own neutral and payoff-only readings. For these two, the persona prompt asks for trust and gets Grudger.",
                "[Provocability](#persona-slope:provocability) tells a related story with a different outlier. At payoff-only, GPT-4o-mini drops to 0.05 while every other model, including Qwen, stays at or above 0.56. Qwen's payoff-only persona is the standout on cooperation, niceness, and forgiveness; GPT-4o-mini's payoff-only persona is the standout on provocability and, less sharply, retaliation. Both models resist the pure-defection collapse that Claude, Gemini, and Grok fall into under payoff-only, just resisting it on different axes.",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "cross-model-surprises",
            heading: "Cross-Model Differences and Surprises",
            paragraphs: [
                "[Discuss cross-model differences and anything counter to expectation: 'neutral' collapses to Grudger-like play by default rather than sitting between Cooperator and Defector, and it's also the top-ranked player overall. Cooperative personas rank worse than neutral for both models, echoing Cooperator's weak finish among classics. Under the cooperative persona, GPT-4o-mini reaches true reciprocal generosity (nearest GTFT) while Claude Haiku keeps retaliation higher (nearest TFT) — same instruction, different underlying disposition. Payoff-only framing doesn't push either model toward colder rationality uniformly.]",
            ],
        },
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
