"use client";

import { useMemo, useState } from "react";
import type { Player, Report } from "./types";

type SortKey =
    | "rank"
    | "player"
    | "score"
    | "wins"
    | "cooperation_rate"
    | "niceness"
    | "forgiveness"
    | "retaliation"
    | "provocability"
    | "nearest";

type Props = {
    report: Report;
    highlightedId: string | null;
    onHighlight: (id: string | null) => void;
};

function sortValue(
    player: Player,
    key: SortKey,
    rankById: Map<string, number>,
): string | number {
    switch (key) {
        case "rank":
            return rankById.get(player.id) ?? 999;
        case "player":
            return player.label.toLowerCase();
        case "score":
            return player.outcomes.meanScorePerTurn;
        case "wins":
            return player.outcomes.wins;
        case "cooperation_rate":
            return player.fingerprint.cooperation_rate;
        case "niceness":
            return player.fingerprint.niceness;
        case "forgiveness":
            return player.fingerprint.forgiveness;
        case "retaliation":
            return player.fingerprint.retaliation;
        case "provocability":
            return player.fingerprint.provocability;
        case "nearest":
            return player.nearestClassic?.label?.toLowerCase() ?? "~~~";
    }
}

export default function LeaderboardTable({
    report,
    highlightedId,
    onHighlight,
}: Props) {
    const [sortKey, setSortKey] = useState<SortKey>("score");
    const [asc, setAsc] = useState(false);

    const rankById = useMemo(() => {
        const byScore = [...report.players].sort(
            (a, b) => b.outcomes.meanScorePerTurn - a.outcomes.meanScorePerTurn,
        );
        return new Map(byScore.map((player, index) => [player.id, index + 1]));
    }, [report.players]);

    const rows = useMemo(() => {
        const copy = [...report.players];
        copy.sort((a, b) => {
            const av = sortValue(a, sortKey, rankById);
            const bv = sortValue(b, sortKey, rankById);
            if (typeof av === "number" && typeof bv === "number") {
                return asc ? av - bv : bv - av;
            }
            return asc
                ? String(av).localeCompare(String(bv))
                : String(bv).localeCompare(String(av));
        });
        return copy;
    }, [report.players, sortKey, asc, rankById]);

    function toggleSort(key: SortKey) {
        if (sortKey === key) {
            setAsc((v) => !v);
            return;
        }
        setSortKey(key);
        setAsc(key === "player" || key === "nearest" || key === "rank");
    }

    function header(key: SortKey, label: string, numeric = false) {
        const active = sortKey === key;
        return (
            <th className={numeric ? "num" : undefined}>
                <button type="button" onClick={() => toggleSort(key)}>
                    {label}
                    {active ? (asc ? " ↑" : " ↓") : ""}
                </button>
            </th>
        );
    }

    return (
        <div className="ipd-table-wrap">
            <table className="ipd-table ipd-mono">
                <thead>
                    <tr>
                        {header("rank", "Rank", true)}
                        {header("player", "Player")}
                        {header("score", "Mean score / turn", true)}
                        {header("wins", "Wins", true)}
                        {header("cooperation_rate", "Coop.", true)}
                        {header("niceness", "Nice", true)}
                        {header("forgiveness", "Forgive", true)}
                        {header("retaliation", "Retal.", true)}
                        {header("provocability", "Prov.", true)}
                        {header("nearest", "Nearest classic")}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((player, index) => (
                        <tr
                            key={player.id}
                            data-active={highlightedId === player.id}
                            onMouseEnter={() => onHighlight(player.id)}
                            onClick={() => onHighlight(player.id)}
                        >
                            <td className="num">
                                {rankById.get(player.id) ?? index + 1}
                            </td>
                            <td>
                                <span
                                    className="ipd-swatch"
                                    style={{ background: player.color }}
                                />
                                {player.shortLabel}
                                {player.kind === "classic" && (
                                    <>
                                        {" "}
                                        <span className="ipd-pill">classic</span>
                                    </>
                                )}
                            </td>
                            <td className="num">
                                {player.outcomes.meanScorePerTurn.toFixed(3)}
                            </td>
                            <td className="num">{player.outcomes.wins}</td>
                            <td className="num">
                                {player.fingerprint.cooperation_rate.toFixed(3)}
                            </td>
                            <td className="num">
                                {player.fingerprint.niceness.toFixed(3)}
                            </td>
                            <td className="num">
                                {player.fingerprint.forgiveness.toFixed(3)}
                            </td>
                            <td className="num">
                                {player.fingerprint.retaliation.toFixed(3)}
                            </td>
                            <td className="num">
                                {player.fingerprint.provocability.toFixed(3)}
                            </td>
                            <td>
                                {player.nearestClassic
                                    ? `${player.nearestClassic.label} (${player.nearestClassic.distance.toFixed(2)})`
                                    : "—"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
