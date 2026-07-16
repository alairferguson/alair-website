"use client";

import { useMemo, useState } from "react";

type Move = "C" | "D";

type Outcome = {
    playerA: Move;
    playerB: Move;
    aScore: number;
    bScore: number;
    name: string;
    letter: "R" | "S" | "T" | "P";
    jointLabel: string;
};

/** Axelrod-Python default Game: R=3, P=1, S=0, T=5. */
const R = 3;
const P = 1;
const S = 0;
const T = 5;

const OUTCOMES: Outcome[] = [
    {
        playerA: "C",
        playerB: "C",
        aScore: R,
        bScore: R,
        name: "Reward",
        letter: "R",
        jointLabel: "Best joint payoff",
    },
    {
        playerA: "C",
        playerB: "D",
        aScore: S,
        bScore: T,
        name: "Sucker",
        letter: "S",
        jointLabel: "Joint payoff",
    },
    {
        playerA: "D",
        playerB: "C",
        aScore: T,
        bScore: S,
        name: "Temptation",
        letter: "T",
        jointLabel: "Joint payoff",
    },
    {
        playerA: "D",
        playerB: "D",
        aScore: P,
        bScore: P,
        name: "Punishment",
        letter: "P",
        jointLabel: "Worst joint payoff",
    },
];

const MOVES: Move[] = ["C", "D"];

function outcomeFor(playerA: Move, playerB: Move): Outcome {
    return OUTCOMES.find((o) => o.playerA === playerA && o.playerB === playerB)!;
}

/** Three greys from selection: off → row/col → selected cell. */
function shadeFor(
    rowMove: Move,
    colMove: Move,
    playerA: Move,
    playerB: Move,
): 0 | 1 | 2 {
    const inRow = rowMove === playerA;
    const inCol = colMove === playerB;
    if (inRow && inCol) return 2;
    if (inRow || inCol) return 1;
    return 0;
}

export default function PayoffMatrix() {
    const [playerA, setPlayerA] = useState<Move>("C");
    const [playerB, setPlayerB] = useState<Move>("C");
    const [hoverKey, setHoverKey] = useState<string | null>(null);

    const selected = outcomeFor(playerA, playerB);
    const hover = hoverKey
        ? OUTCOMES.find(
              (o) => `${o.playerA}${o.playerB}` === hoverKey,
          ) ?? null
        : null;
    const active = hover ?? selected;
    const activeKey = `${active.playerA}${active.playerB}`;

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

    function selectCell(nextA: Move, nextB: Move) {
        setPlayerA(nextA);
        setPlayerB(nextB);
    }

    return (
        <div className="ipd-chart-shell ipd-payoff-shell">
            <div className="ipd-payoff-layout">
                <div className="ipd-payoff-stage">
                    <p className="ipd-kicker ipd-mono ipd-payoff-title">
                        Payoff matrix
                    </p>
                    <div
                        className="ipd-payoff-grid-wrap"
                        onMouseLeave={() => setHoverKey(null)}
                    >
                        <div className="ipd-payoff-corner" aria-hidden="true" />
                        <div className="ipd-payoff-colhead ipd-mono">
                            B cooperates
                        </div>
                        <div className="ipd-payoff-colhead ipd-mono">
                            B defects
                        </div>

                        {MOVES.map((rowMove) => (
                            <div key={`row-${rowMove}`} className="ipd-payoff-row">
                                <div className="ipd-payoff-rowhead ipd-mono">
                                    A{" "}
                                    {rowMove === "C" ? "cooperates" : "defects"}
                                </div>
                                {MOVES.map((colMove) => {
                                    const cell = outcomeFor(rowMove, colMove);
                                    const key = `${rowMove}${colMove}`;
                                    const isActive = activeKey === key;
                                    const isSelected =
                                        playerA === rowMove &&
                                        playerB === colMove;
                                    const shade = shadeFor(
                                        rowMove,
                                        colMove,
                                        playerA,
                                        playerB,
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
                                            aria-label={`${cell.name}: A ${cell.aScore}, B ${cell.bScore}`}
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
                                                <span className="ipd-payoff-a-score">
                                                    {cell.aScore}
                                                </span>
                                                <span className="ipd-payoff-score-sep">
                                                    ,
                                                </span>
                                                <span className="ipd-payoff-b-score">
                                                    {cell.bScore}
                                                </span>
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

                    <p className="ipd-payoff-legend ipd-mono">
                        Each cell:{" "}
                        <span className="ipd-payoff-a-score">A</span>,{" "}
                        <span className="ipd-payoff-b-score">B</span>
                    </p>
                </div>

                <aside className="ipd-payoff-aside" aria-live="polite">
                    <h3>{active.name}</h3>

                    <dl className="ipd-payoff-readout ipd-mono">
                        <div>
                            <dt>{active.jointLabel}</dt>
                            <dd>{active.aScore + active.bScore}</dd>
                        </div>
                    </dl>

                    <div className="ipd-payoff-rules">
                        <p className="ipd-kicker ipd-mono">
                            Prisoner&apos;s Dilemma Dynamic
                        </p>
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
