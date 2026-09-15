import { CLAUDE_COLOR, OPENAI_COLOR } from "./colors";

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

function PersonIcon({ color }: { color: string }) {
    return (
        <svg
            viewBox="0 0 40 40"
            className="ipd-payoff-person"
            aria-hidden="true"
        >
            <circle cx="20" cy="13.5" r="6.4" fill={color} />
            <path
                d="M20 22.4c-6.3 0-11.4 4.7-11.4 10.5 0 .8.7 1.5 1.5 1.5h19.8c.8 0 1.5-.7 1.5-1.5 0-5.8-5.1-10.5-11.4-10.5z"
                fill={color}
            />
        </svg>
    );
}

export default function PayoffMatrix() {
    return (
        <div
            className="ipd-payoff-shell"
            role="img"
            aria-label="Payoff matrix. Rows are player A's cooperate and defect; columns are player B's cooperate and defect. Cells show A's score then B's score: 3 / 3, 0 / 5, 5 / 0, and 1 / 1."
        >
            <div className="ipd-payoff-top">
                <PersonIcon color={OPENAI_COLOR} />
                <div className="ipd-payoff-col-labels ipd-mono">
                    <span>Cooperate</span>
                    <span>Defect</span>
                </div>
            </div>
            <div className="ipd-payoff-board-wrap">
                <div className="ipd-payoff-left">
                    <PersonIcon color={CLAUDE_COLOR} />
                    <div className="ipd-payoff-row-labels ipd-mono">
                        <span>Cooperate</span>
                        <span>Defect</span>
                    </div>
                </div>
                <div className="ipd-payoff-board">
                    {MOVES.flatMap((rowMove) =>
                        MOVES.map((colMove) => {
                            const cell = outcomeFor(rowMove, colMove);
                            return (
                                <div
                                    key={`${rowMove}${colMove}`}
                                    className="ipd-payoff-cell ipd-mono"
                                >
                                    <span className="ipd-payoff-a">
                                        {cell.aScore}
                                    </span>
                                    <span className="ipd-payoff-sep">/</span>
                                    <span className="ipd-payoff-b">
                                        {cell.bScore}
                                    </span>
                                </div>
                            );
                        }),
                    )}
                </div>
            </div>
        </div>
    );
}
