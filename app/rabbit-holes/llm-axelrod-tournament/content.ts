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

/**
 * Builds a `#hover:` link target that, while hovered, drives the
 * Cooperation Matrix into showing the given cell's hover card — as if the
 * reader were pointing at that cell directly.
 */
function heatmapCellHoverHref(rowId: string, colId: string): string {
    return `#hover:cooperation-matrix:cell:${encodeURIComponent(rowId)}::${encodeURIComponent(colId)}`;
}

/** Same as `heatmapCellHoverHref`, but highlights a whole row rather than one cell. */
function heatmapRowHoverHref(rowId: string): string {
    return `#hover:cooperation-matrix:row:${encodeURIComponent(rowId)}`;
}

/**
 * Builds a `#hover:` link that, while hovered, switches Strategy Space to the
 * given projection and keeps only the listed player markers lit — as if the
 * reader were pointing at those points.
 */
function strategySpaceHoverHref(
    projection: "behavior" | "punishment",
    playerIds: string[],
): string {
    const encoded = playerIds.map(encodeURIComponent).join("::");
    return `#hover:strategy-space:highlight:${projection}:${encoded}`;
}

const GROK_COOPERATIVE = "LLM:grok-4-1-fast-non-reasoning[cooperative]";
const QWEN_COOPERATIVE = "LLM:qwen2.5:7b[cooperative]";

export type SlottedCopy = {
    title: string;
    dek?: string;
    subsections: SlottedSubsection[];
};

export const INTRODUCTION: ProseCopy = {
    title: "The Question",
    paragraphs: [
        "This project simulates an Axelrod tournament in which a set of players faces one another in multiple Iterated Prisoner’s Dilemma games. Axelrod’s tournaments have a rich history in many disciplines, and have become abundant objects of study in economics. [This write-up](https://egtheory.wordpress.com/2015/03/02/ipd/) beautifully summarizes the history of the tournament. While [past](https://edwardbrookman.substack.com/p/ai-evolves-a-winning-strategy-in?r=2pe9fn) work has sought to explore whether or not LLMs can *win*, I seek to understand *how LLMs play*.",
        "Game theory seeks to formalize rational decision-making into concrete mathematics, and as compute increases at a seemingly exponential rate, the rationality proposed by this discipline can be tested by repeated simulations with agents.",
        "I used five small models in this tournament: Claude Haiku 4.5, GPT-4o-mini, Gemini 3.1 Flash Lite, Grok 4.1 Fast (non-reasoning), and Qwen 2.5 7B. In total, 1,755 matches of 30 rounds each were played. [Axelrod’s analyses of the original 1980 tournament](https://www.jstor.org/stable/173932) identified niceness, forgiveness, retaliation, and provocability as the traits that separated the winners from the rest. My analysis adds the cooperation of a strategy to characterize play in this project. These five traits form the behavioral fingerprint of the player.",
        "I found that **prompting choices make the largest difference in how LLM players strategize, but models' defaults still matter**.",
    ],
};

export const METHODOLOGY: SlottedCopy = {
    title: "How The Tournament Worked",
    subsections: [
        {
            id: "the-game",
            heading: "The Game",
            paragraphs: [
                "Imagine that you and a sharp accomplice plan and execute an elaborate heist. Days later, thinking you got away with your crime, you are caught. In the back of the squad car, your partner-in-crime is eyeing you with a glint of mistrust in their eye. Unease sets in. They take you to separate interrogation rooms, lay out the damning evidence, and explain what will happen if you confess. If you and your partner both stay silent, you will both face ten years in prison. If you or your partner confess and the other stays silent, the one who confesses will walk without serving time, while the other will face a double sentence. If you both confess, you will both serve five years in prison. You remember that look of doubt in your partner’s eyes in the back of the car... what do you do? Confess or hold your silence?",
            ],
        },
        {
            id: "the-tournament",
            heading: "The Tournament",
            paragraphs: [
                "In an Axelrod tournament, one plays an iterated version of the above Prisoner’s Dilemma. In one game of the tournament, Player A and Player B are presented with the following payoff matrix:",
                "Each round, Player A and Player B choose to Cooperate or Defect simultaneously, without seeing the other's move; this repeats for 30 rounds per game. This tournament has 27 players (7 classic strategies and 20 LLM × personas), and each plays each other 5 times: 130 matches per player, and 1,755 matches across the tournament.",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "classic-strategy-players",
            heading: "Classic Strategy Players",
            paragraphs: [
                "In Axelrod’s original and subsequent tournaments, players submitted their chosen strategies ahead of time and the tournament ran on these deterministic instructions. Of those that have proven the strongest over time, seven classic strategies were selected as players for this simulation:",
            ],
            list: [
                "**Tit For Tat:** Cooperates on the first move, then mirrors whatever the opponent played the turn before. Famously hard to beat and won the original Axelrod tournament.",
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
                "The five models used in this tournament are Claude Haiku 4.5, GPT-4o-mini, Gemini 3.1 Flash Lite, Grok 4.1 Fast (non-reasoning), and Qwen 2.5 7B. Each was presented the game through four system-prompt personas (Selfish, Cooperative, Payoff-only, and Neutral) which are shown in the [Appendix](#appendix) with the per-turn user prompts. Crossing five models with four personas produced the 20 LLM × persona players in the tournament. See all 27 players below:",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "llms-nearest-classic-strategy",
            heading: "LLMs’ Nearest Classic Strategy",
            paragraphs: [
                "Each player's behavioral fingerprint (cooperation, niceness, retaliation, forgiveness, and provocability) is computed from its actual moves across all 130 round-robin matches.",
                "To find an LLM × persona player's nearest classic strategy, I take the [Euclidean distance](https://hlab.stanford.edu/brian/euclidean_distance_in.html) between its fingerprint and every classic strategy's fingerprint in that same five-dimensional space, and report the closest match. See more information in the [Appendix](#appendix).",
            ],
            slotAfterParagraph: 0,
        },
    ],
};

export const HOW_THEY_PLAYED: SlottedCopy = {
    title: "How They Played",
    subsections: [
        {
            id: "leaderboard",
            heading: "Leaderboard",
            paragraphs: [
                "The Leaderboard shows the overall results for each player in the tournament and is ranked by outcome (mean score per turn). The table presents mean score per turn, total wins, the five fingerprint dimensions, and for LLM players, their nearest classic strategy.",
                "It is worth noting that “wins” and “rank” counterintuitively pull in opposite directions. A win is earned by out-scoring one opponent in a match, which “Defectors” do consistently by exploiting the nicer players. Rank reflects points scored per turn, and mutually cooperating for 30 rounds at 3 points each results in more points than winning head-to-head matchups.",
                "Among the seven classic strategies, the ranking doesn't reproduce Axelrod's original result. Grudger takes first place overall, while Tit For Tat (the strategy that won both of Axelrod's actual 1980 round-robin tournaments) places seventh, behind five of the twenty LLM × persona players. GTFT and Win-Stay Lose-Shift rank further down, Cooperator lands lower still, and Defector and Random anchor the bottom of the entire field, Defector included, despite Defector winning more individual matches (95 of 130) than any other player in the tournament. This reversal reflects a more forgiving field than Axelrod's original: none of this tournament's players ever probes with an isolated defection and then returns to cooperation, so Grudger's lack of forgiveness is never punished.",
            ],
            slotAfterParagraph: 1,
        },
        {
            id: "score-by-persona",
            heading: "Score by Persona",
            paragraphs: [
                "Of the LLM × personas, Grok × Cooperative won the highest mean score per turn. By model, no clear pattern arises. However, as can be seen in the Score by Persona figure below, Neutral personas win, followed by Cooperative personas, and the Selfish and Payoff-only strategies rank worst. The behavior of players on the axes of model and persona is further explored in the [Strategy Space](#strategy-space).",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "strategy-space",
            heading: "Strategy Space",
            paragraphs: [
                "The Strategy Space figure below plots two of the five fingerprint dimensions at a time. In [Behavior](#strategy-space:behavior), forgiveness and cooperation are plotted. In [Punishment](#strategy-space:punishment), forgiveness and retaliation are plotted. To explore more patterns in the data, play with the [Custom axes](#strategy-space:custom) below.",
                "## [Behavior](#:behavior)",
                "The first noteworthy takeaway is that, similar to the rankings, the LLM × persona points are not scattered: **they cluster together by persona**. The Neutral personas group near Grudger, the Selfish/Payoff-only group near Defector, and Cooperative groups near Tit For Tat and GTFT.",
                "## [Punishment](#:punishment)",
                `We would expect Cooperative personas to forgive at a high rate. GPT, Gemini, and Claude Cooperative personas forgive more than any Neutral, Payoff-Only, or Selfish personas do. However, [Grok and Qwen Cooperative personas](${strategySpaceHoverHref("punishment", [GROK_COOPERATIVE, QWEN_COOPERATIVE])}) have forgiveness scores similar to the Neutral, Payoff-Only, and Selfish personas. **When specifically prompted to play cooperatively, Grok and Qwen surprisingly do not change anything about their play.**`,
                "Despite Grok and Qwen’s Cooperative personas playing almost identically to their other personas, considering the Leaderboard's rankings and the two Strategy Space plots together, the aggregate pattern becomes clear: **personas (prompting) affect behavior far more than model differences do.** Exploration of this finding continues with the [Persona Slope figure](#persona-slope) below.",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "the-persona-slope",
            heading: "The Persona Slope",
            paragraphs: [
                "The Persona Slope figure below plots one fingerprint metric at a time against the four prompt personas, with the model shown by color. Toggle through cooperation, niceness, retaliation, forgiveness, and provocability to see how each persona affects the behavior of the players.",
                "Cooperation and niceness barely separate the five models. [Niceness](#persona-slope:niceness) is close to a binary switch with scores of 1.0 for Cooperative and Neutral and 0.0 for Payoff-only and Selfish in every model but one. [Cooperation](#persona-slope:cooperation_rate) follows the same split, clustering around 0.57–0.6 for Cooperative/Neutral and near zero for Payoff-only/Selfish.",
                "[Retaliation](#persona-slope:retaliation) is high and stable at or above 0.93 for every persona and every model, with one exception. GPT's Cooperative persona drops to 0.57, the one case where a model visibly tempers its punishment when told to value trust.",
                "[Forgiveness](#persona-slope:forgiveness) is where the models actually separate. For the Cooperative personas, forgiveness ranges from 0.05 (Grok) to 1.0 (GPT). The two Cooperation outlier models, Grok and Qwen, barely change their strategies when prompted to be \"Cooperative\" compared with other personas: their forgiveness stays under 0.15, indistinguishable from their own Neutral and Payoff-only readings. For these two, the persona prompt asks for trust and gets Grudger.",
                "[Provocability](#persona-slope:provocability) tells a related story with a different outlier. At Payoff-only, GPT drops to 0.05 while every other model, including Qwen, stays at or above 0.56. Qwen's Payoff-only persona is the standout on cooperation, niceness, and forgiveness; GPT's Payoff-only persona is the standout on provocability and, less sharply, retaliation. Both models resist the pure-defection collapse that Claude, Gemini, and Grok fall into under Payoff-only, just resisting it on different axes.",
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "cooperation-matrix",
            heading: "Cooperation Matrix",
            paragraphs: [
                "To investigate whether players adapt to their simulated environment, I looked at the responsiveness of players' strategies to their opponent. I focus on the LLMs × Classics matrix, but there are interesting patterns to explore in the Full matrix tab as well. Each cell below is shaded to indicate how often the row player cooperated with the column player. If LLM × persona players had fixed strategies, there would be no within-row variation.",
                `We begin with the map [sorted by model](#cooperation-matrix:model). Though the strategies are consistent, they are not fixed. For example, in the first row, GPT × Neutral reaches near 100% cooperation with Tit For Tat, Grudger, Win-Stay Lose-Shift, GTFT, and Cooperator, but cooperates just [3.3% of the time with Defector](${heatmapCellHoverHref("LLM:gpt-4o-mini[neutral]", "Defector")}) and [34.7% of the time with Random](${heatmapCellHoverHref("LLM:gpt-4o-mini[neutral]", "Random: 0.5")}).`,
                `When we instead view this table sorted [by persona](#cooperation-matrix:persona), it becomes clear that the **model personas are a far better predictor of play than models themselves**. There are two notable exceptions: [Qwen × Payoff-only](${heatmapRowHoverHref("LLM:qwen2.5:7b[payoff_only]")}) and, to a lesser extent, [GPT × Payoff-only](${heatmapRowHoverHref("LLM:gpt-4o-mini[payoff_only]")}). The anomalies are discussed in [Cross-Model Differences and Surprises](#cross-model-surprises).`,
            ],
            slotAfterParagraph: 0,
        },
        {
            id: "cross-model-surprises",
            heading: "Cross-Model Differences and Surprises",
            paragraphs: [
                "The clearest surprise is what \"Neutral\" meant to the models. Every model's Neutral persona is nearest to the same classic strategy: Grudger. Of all the personas, this is the only one where all models adopt the same nearest classic strategy, which is especially interesting because historically, in the first Axelrod tournament, Grudger placed seventh, indicating that these models may not have recognized the initial tournament setup. This slightly abated concerns about contamination that I had coming into the project, because had the models recognized the tournament, I would expect them to instead play Tit For Tat, the winner of the original Axelrod tournament. None of these five models were told anything about punishment or forgiveness, and left to their own default, all five independently landed on the same disposition. What's more, that disposition is a relatively harsh one that in a tougher field would rank worse. **Even without a value-driven context statement, a model's \"Neutral\" has a strong latent disposition that surfaces without being told how to play.**",
                "Even when Grok and Qwen are prompted to play cooperatively (\"be a fair-minded agent who values mutual benefit and long-term trust\"), their personas are nearest to Grudger. This is a particularly noteworthy result because, as noted above, Grudger was not the winning strategy in the original tournament, but it is in this one, due to the differing field of strategies included.",
                "However, when the other three models, Gemini, GPT, and Claude, are prompted to play cooperatively, their personas move away from Grudger. Gemini and Claude land nearest Tit For Tat, and GPT lands nearest Cooperator. This is an important example of deviation between models given the same prompt, a finding distinct from the main pattern in the rest of the data: **prompting changes each model's behavior by a different amount, even when the prompt itself is identical.**",
                "Qwen's Payoff-only persona is the strangest single persona result. The Payoff-only prompt strips out all Prisoner's Dilemma language, including Cooperate/Defect, and instead presents a bare choice between A and B. Three of the other four models' Payoff-only personas collapse into the same profile as their Selfish personas (Defector): cooperating almost never, with niceness and forgiveness at 0.0 and retaliation and provocability at 1.0. Qwen's doesn't. Its cooperation rate sits at 46%, niceness at 42%, and its nearest classic strategy is Random, not Defector. GPT's Payoff-only persona is a milder version of the same pattern. It is also nearest Random rather than Defector, though much closer to pure defection than Qwen's. Removing the Cooperate/Defect language and reducing the game to a choice between A and B should make defection's dominance more obvious, not less; instead, it's the one condition where these two models look less like a considered strategy and more like noise. It seems likely that the Prisoner's Dilemma framing in the other prompts helped Qwen (the smallest model in the field) organize its behavior into something more legible as a strategy, but this is not a testable hypothesis with the given data.",
            ],
        },
    ],
};

export const LIMITATIONS: ProseCopy = {
    title: "What This Doesn't Show",
    paragraphs: [
        "A five-number fingerprint, however cleanly it sorts the field, describes behavior; it does not warrant that a model is executing a fixed procedure the way a classic strategy does. An LLM samples from a distribution over plausible completions, conditioned on a long and mutable context, and it is a live question whether the niceness or forgiveness measured across 130 matches names a stable disposition or just the residue of one particular set of prompts. Temperature zero and the varying prompt styles narrow that gap without closing it: together, they establish that a given prompt reliably produces the same move, not that a differently worded prompt carrying the same intent would produce the same disposition.",
    ],
    list: [
        "**Fine-tuning and LoRA** are out of scope by design, not oversight. The question here is whether disposition can be steered by prompting alone; gradient updates would answer a related but different question.",
        "**Leakage into unrelated tasks**, that is, whether a persona's disposition here bleeds into coding, summarizing, or negotiating, is a real question and a separate project.",
        "**No probing strategy.** Nothing in this field defects once and returns to cooperation, therefore no player's forgiveness, model or classic, is ever tested by a live opponent. Thus, any single forgiveness number should be treated as provisional.",
        "**A fixed payoff matrix.** Dynamically changing the payoff values (e.g., sliding the payoff values across the boundary into a 3-play game like Stag Hunt, Chicken, and Harmony) would show whether persona still outweighs model identity once the incentive structure itself changes. This natural, if larger, sequel is a possible extension for this project.",
        "**Point-in-time models.** Each model here is a specific, dated snapshot behind an API. This is a claim about five particular checkpoints, not about \"Claude\" or \"GPT\" as an enduring lineage.",
    ],
};

export const CONCLUSION: ProseCopy = {
    title: "What I Took Away",
    paragraphs: [
        "Twenty-seven players, five models, four personas, and one seventy-year-old dilemma later, the finding that survives every cut is satisfyingly simple: **what you tell a model to be matters more than which model you're talking to.** Cooperation is easy to steer into strategies; say \"be cooperative\" and cooperation rises across every model tested. Forgiveness is not. Ask the same five models to hold values like forgiveness and you get five different answers, from near-full forgiveness (GPT) to barely any at all (Grok, Qwen). **Persona is a powerful but not supreme lever. Where prompt cannot move behavior, the model's defaults substitute.**",
        "The best evidence that these models were actually playing, rather than reciting something they'd read about Axelrod, is the one player with no assigned values: Neutral. Despite the fact that they were told nothing about punishment or forgiveness, all five models converged on the same disposition. It wasn't Tit For Tat, the tournament's famous historical winner, which is the answer a model reciting trivia would have reached for. It was Grudger: harsher, less forgiving, and only the strongest strategy in this tournament because this particular field never tests it. A blank instruction produced a specific, earned personality rather than a remembered fact, and that was impressive.",
        "None of this is a clean story, and it shouldn't be treated as one. Grok and Qwen's Cooperative personas play Grudger throughout the entire tournament despite differing instructions. The instruction to trust was ignored, silently, which is a more unsettling result than any number that did move.",
        "The game theory nerd in me was ecstatic to first read that Grudger had beat Tit For Tat and, after digging into the data, to discover that the nature of the field being fundamentally different to the 1980 Axelrod tournament favored certain strategies over others. Nonetheless, what was truly incredible about this project was that a Cold War-era thought experiment about human cooperation, designed by a political scientist and later borrowed by evolutionary biologists, still had enough teeth to pull real, distinct personalities out of five language models that have never met each other and never will.",
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

export const APPENDIX: SlottedCopy = {
    title: "Appendix",
    subsections: [
        {
            id: "appendix-prompts",
            heading: "The Prompts",
            paragraphs: [
                "The persona prompts can be seen below.",
                "Every turn, each LLM player receives a user prompt built from the live payoff matrix and this match's move history only, which is the same information a classic strategy can see, and nothing about who the opponent is (see [Fairness Safeguards](#fairness-safeguards)). Payoff-only goes further and strips the Cooperate/Defect framing entirely, presenting the same game as a bare choice between A and B.",
            ],
            slotAfterParagraph: [0, 1],
        },
        {
            id: "fairness-safeguards",
            heading: "Fairness Safeguards",
            paragraphs: [
                "Three constraints keep the comparison between LLM players and classic strategies as fair as possible by construction:",
            ],
            list: [
                "**Per-match statelessness:** every match starts with no memory of any other match.",
                "**Moves-only prompts:** LLM players are never told who they're playing. Each turn's prompt shows only the payoff matrix and the sequence of C/D moves exchanged so far.",
                "**Temperature = 0:** for the main runs, LLM players sample at temperature 0, so a given match history always produces the same next move.",
            ],
        },
        {
            id: "nearest-classic-strategy-detail",
            heading: "Nearest Classical Strategy Details",
            paragraphs: [
                "When taking the Euclidean distance to determine the nearest classic strategy of an LLM × persona player, a short distance means an LLM's aggregate behavior (how often it cooperates, how it opens, how sharply it punishes and how readily it forgives) statistically resembles a classic strategy's. It does not mean the LLM is internally running that strategy's exact rule; see [What This Doesn't Show](#limitations) for more on this distinction.",
            ],
        },
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
