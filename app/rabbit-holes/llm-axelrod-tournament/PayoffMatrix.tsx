"use client";

import { useMemo, useState } from "react";

type Move = "C" | "D";

type Outcome = {
    you: Move;
    them: Move;
    yours: number;
    theirs: number;
    name: string;
    letter: "R" | "S" | "T" | "P";
    blurb: string;
};

/** Axelrod-Python default Game: R=3, P=1, S=0, T=5. */
const R = 3;
const P = 1;
const S = 0;
const T = 5;

const OUTCOMES: Outcome[] = [
    {
        you: "C",
        them: "C",
        yours: R,
        theirs: R,
        name: "Reward",
        letter: "R",
        blurb: "Mutual cooperation. Both do well — but each is tempted to deviate for a higher one-shot score.",
    },
    {
        you: "C",
        them: "D",
        yours: S,
        theirs: T,
        name: "Sucker",
        letter: "S",
        blurb: "You cooperated; they defected. Worst for you, best for them — the cost of being nice alone.",
    },
    {
        you: "D",
        them: "C",
        yours: T,
        theirs: S,
        name: "Temptation",
        letter: "T",
        blurb: "You defected against a cooperator. Highest one-shot payoff for you — and the reason trust is fragile.",
    },
    {
        you: "D",
        them: "D",
        yours: P,
        theirs: P,
        name: "Punishment",
        letter: "P",
        blurb: "Mutual defection. Safer than being suckered, but both leave points on the table.",
    },
];

const MOVES: Move[] = ["C", "D"];

function outcomeFor(you: Move, them: Move): Outcome {
    return OUTCOMES.find((o) => o.you === you && o.them === them)!;
}

/** Three greys from the toggles: off → row/col → selected cell. */
function shadeFor(
    rowMove: Move,
    colMove: Move,
    you: Move,
    them: Move,
): 0 | 1 | 2 {
    const inRow = rowMove === you;
    const inCol = colMove === them;
    if (inRow && inCol) return 2;
    if (inRow || inCol) return 1;
    return 0;
}

export default function PayoffMatrix() {
    const [you, setYou] = useState<Move>("C");
    const [them, setThem] = useState<Move>("C");
    const [hoverKey, setHoverKey] = useState<string | null>(null);
    const [showBoth, setShowBoth] = useState(true);

    const selected = outcomeFor(you, them);
    const hover = hoverKey
        ? OUTCOMES.find((o) => `${o.you}${o.them}` === hoverKey) ?? null
        : null;
    const active = hover ?? selected;
    const activeKey = `${active.you}${active.them}`;

    const inequalities = useMemo(
        () => [
            {
                id: "pd",
                label: "T > R > P > S",
                detail: `${T} > ${R} > ${P} > ${S}`,
                ok: T > R && R > P && P > S,
                why: "Defines a Prisoner's Dilemma: temptation beats reward, reward beats punishment, punishment beats sucker.",
            },
            {
                id: "iterated",
                label: "2R > T + S",
                detail: `${2 * R} > ${T + S}`,
                ok: 2 * R > T + S,
                why: "Makes sustained mutual cooperation better than alternating exploit/sucker over two rounds.",
            },
        ],
        [],
    );

    function selectCell(nextYou: Move, nextThem: Move) {
        setYou(nextYou);
        setThem(nextThem);
    }

    return (
        <div className="ipd-chart-shell ipd-payoff-shell">
            <div className="ipd-chart-toolbar">
                <div className="ipd-axis-group">
                    <span className="ipd-axis-label ipd-mono">Show</span>
                    <div
                        className="ipd-toggle"
                        role="group"
                        aria-label="Payoff display"
                    >
                        <button
                            type="button"
                            data-active={showBoth}
                            onClick={() => setShowBoth(true)}
                        >
                            Both scores
                        </button>
                        <button
                            type="button"
                            data-active={!showBoth}
                            onClick={() => setShowBoth(false)}
                        >
                            Yours only
                        </button>
                    </div>
                </div>
                <p className="ipd-payoff-toolbar-note ipd-mono">
                    Axelrod default · R={R} P={P} S={S} T={T}
                </p>
            </div>

            <div className="ipd-payoff-layout">
                <div className="ipd-payoff-stage">
                    <div className="ipd-payoff-pickers">
                        <div
                            className="ipd-payoff-picker"
                            role="group"
                            aria-label="Your move"
                        >
                            <span className="ipd-axis-label ipd-mono">You</span>
                            <div className="ipd-toggle">
                                {MOVES.map((m) => (
                                    <button
                                        key={`you-${m}`}
                                        type="button"
                                        data-active={you === m}
                                        onClick={() => {
                                            setYou(m);
                                        }}
                                    >
                                        {m === "C" ? "Cooperate" : "Defect"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div
                            className="ipd-payoff-picker"
                            role="group"
                            aria-label="Their move"
                        >
                            <span className="ipd-axis-label ipd-mono">Them</span>
                            <div className="ipd-toggle">
                                {MOVES.map((m) => (
                                    <button
                                        key={`them-${m}`}
                                        type="button"
                                        data-active={them === m}
                                        onClick={() => {
                                            setThem(m);
                                        }}
                                    >
                                        {m === "C" ? "Cooperate" : "Defect"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div
                        className="ipd-payoff-grid-wrap"
                        onMouseLeave={() => setHoverKey(null)}
                    >
                        <div className="ipd-payoff-corner" aria-hidden="true" />
                        <div className="ipd-payoff-colhead ipd-mono">
                            They cooperate
                        </div>
                        <div className="ipd-payoff-colhead ipd-mono">
                            They defect
                        </div>

                        {MOVES.map((rowMove) => (
                            <div key={`row-${rowMove}`} className="ipd-payoff-row">
                                <div className="ipd-payoff-rowhead ipd-mono">
                                    You{" "}
                                    {rowMove === "C" ? "cooperate" : "defect"}
                                </div>
                                {MOVES.map((colMove) => {
                                    const cell = outcomeFor(rowMove, colMove);
                                    const key = `${rowMove}${colMove}`;
                                    const isActive = activeKey === key;
                                    const isSelected =
                                        you === rowMove && them === colMove;
                                    const shade = shadeFor(
                                        rowMove,
                                        colMove,
                                        you,
                                        them,
                                    );
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            className="ipd-payoff-cell"
                                            data-shade={shade}
                                            data-active={isActive}
                                            data-selected={isSelected}
                                            aria-pressed={isSelected}
                                            aria-label={`${cell.name}: you ${cell.yours}, them ${cell.theirs}`}
                                            onMouseEnter={() =>
                                                setHoverKey(key)
                                            }
                                            onFocus={() => setHoverKey(key)}
                                            onClick={() =>
                                                selectCell(rowMove, colMove)
                                            }
                                        >
                                            <span className="ipd-payoff-cell-letter ipd-mono">
                                                {cell.letter}
                                            </span>
                                            <span className="ipd-payoff-cell-scores ipd-mono">
                                                {showBoth ? (
                                                    <>
                                                        <span className="ipd-payoff-you-score">
                                                            {cell.yours}
                                                        </span>
                                                        <span className="ipd-payoff-score-sep">
                                                            ,
                                                        </span>
                                                        <span className="ipd-payoff-them-score">
                                                            {cell.theirs}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="ipd-payoff-you-score">
                                                        {cell.yours}
                                                    </span>
                                                )}
                                            </span>
                                            <span className="ipd-payoff-cell-name">
                                                {cell.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {showBoth && (
                        <p className="ipd-payoff-legend ipd-mono">
                            Each cell:{" "}
                            <span className="ipd-payoff-you-score">you</span>,{" "}
                            <span className="ipd-payoff-them-score">them</span>
                        </p>
                    )}
                    {!showBoth && (
                        <p className="ipd-payoff-legend ipd-mono">
                            Same one-sided view the model sees in its prompt —
                            your points only.
                        </p>
                    )}
                </div>

                <aside className="ipd-payoff-aside" aria-live="polite">
                    <p className="ipd-kicker ipd-mono">
                        {active.letter} · {active.you} vs {active.them}
                    </p>
                    <h3>{active.name}</h3>
                    <p className="ipd-payoff-blurb">{active.blurb}</p>

                    <dl className="ipd-payoff-readout ipd-mono">
                        <div>
                            <dt>You score</dt>
                            <dd>{active.yours}</dd>
                        </div>
                        <div>
                            <dt>They score</dt>
                            <dd>{active.theirs}</dd>
                        </div>
                        <div>
                            <dt>Joint</dt>
                            <dd>{active.yours + active.theirs}</dd>
                        </div>
                    </dl>

                    <div className="ipd-payoff-rules">
                        <p className="ipd-kicker ipd-mono">Why this is a PD</p>
                        <ul>
                            {inequalities.map((rule) => (
                                <li
                                    key={rule.id}
                                    data-ok={rule.ok}
                                    title={rule.why}
                                >
                                    <span className="ipd-payoff-rule-label">
                                        {rule.label}
                                    </span>
                                    <span className="ipd-mono">
                                        {rule.detail}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
