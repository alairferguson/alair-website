type Move = "C" | "D";

type Outcome = {
    playerA: Move;
    playerB: Move;
    aScore: number;
    bScore: number;
    name: string;
};

/** Axelrod-Python default Game: R=3, P=1, S=0, T=5. */
const R = 3;
const P = 1;
const S = 0;
const T = 5;

const OUTCOMES: Outcome[] = [
    { playerA: "C", playerB: "C", aScore: R, bScore: R, name: "Reward" },
    { playerA: "C", playerB: "D", aScore: S, bScore: T, name: "Sucker" },
    { playerA: "D", playerB: "C", aScore: T, bScore: S, name: "Temptation" },
    { playerA: "D", playerB: "D", aScore: P, bScore: P, name: "Punishment" },
];

const MOVES: Move[] = ["C", "D"];

function outcomeFor(playerA: Move, playerB: Move): Outcome {
    return OUTCOMES.find((o) => o.playerA === playerA && o.playerB === playerB)!;
}

export default function PayoffMatrix() {
    return (
        <div className="ipd-chart-shell ipd-payoff-shell">
            <div className="ipd-payoff-stage">
                <p className="ipd-kicker ipd-mono ipd-payoff-title">
                    Payoff matrix
                </p>
                <div className="ipd-payoff-grid-wrap">
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
                                return (
                                    <div
                                        key={`${rowMove}${colMove}`}
                                        className="ipd-payoff-cell"
                                        aria-label={`${cell.name}: A ${cell.aScore}, B ${cell.bScore}`}
                                    >
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
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <p className="ipd-payoff-legend ipd-mono">
                    Each cell: <span className="ipd-payoff-a-score">A</span>,{" "}
                    <span className="ipd-payoff-b-score">B</span>
                </p>
            </div>
        </div>
    );
}
