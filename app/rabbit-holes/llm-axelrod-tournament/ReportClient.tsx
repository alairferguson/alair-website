"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import FingerprintScatter from "./FingerprintScatter";
import LeaderboardTable from "./LeaderboardTable";
import type { MetricId, Report } from "./types";
import "./report.css";

type Props = {
    report: Report;
};

export default function ReportClient({ report }: Props) {
    const [xMetric, setXMetric] = useState<MetricId>(
        report.meta.defaultAxes.x,
    );
    const [yMetric, setYMetric] = useState<MetricId>(
        report.meta.defaultAxes.y,
    );
    const [filter, setFilter] = useState<"all" | "llm" | "classic">("all");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const dimCards = useMemo(
        () => report.metrics.filter((m) => m.id !== "mean_score_per_turn"),
        [report.metrics],
    );

    return (
        <div className="ipd-report">
            <div className="ipd-shell">
                <div className="ipd-topbar">
                    <Link href="/#rabbit-holes" className="ipd-back ipd-mono">
                        ← Rabbit holes
                    </Link>
                    <span className="ipd-kicker ipd-mono">Research report</span>
                </div>

                <header className="ipd-hero">
                    <h1>{report.title}</h1>
                    <p>{report.subtitle}</p>
                    <div className="ipd-meta ipd-mono">
                        <span>{report.meta.players} players</span>
                        <span>
                            {report.meta.llms} LLM × persona
                            {report.meta.llms === 1 ? "" : "s"}
                        </span>
                        <span>{report.meta.classics} classic strategies</span>
                        {report.meta.turns != null && (
                            <span>{report.meta.turns} turns / match</span>
                        )}
                        {report.meta.matchesPerPlayer != null && (
                            <span>
                                {report.meta.matchesPerPlayer} matches / player
                            </span>
                        )}
                    </div>
                </header>

                <section aria-label="Fingerprint scatter">
                    <FingerprintScatter
                        report={report}
                        xMetric={xMetric}
                        yMetric={yMetric}
                        onXMetricChange={setXMetric}
                        onYMetricChange={setYMetric}
                        filter={filter}
                        onFilterChange={setFilter}
                        highlightedId={highlightedId}
                        onHighlight={setHighlightedId}
                    />
                    <p className="ipd-footnote">
                        Classics are circles; LLM × persona variants are stars.
                        Lines connect personas of the same model. Hover a point
                        or table row to inspect the fingerprint; switch axes to
                        re-project strategy space.
                    </p>
                </section>

                <section className="ipd-section" aria-label="Leaderboard">
                    <div className="ipd-section-head">
                        <div>
                            <h2>Leaderboard</h2>
                            <p>
                                Ranked by mean score per turn. Nearest classic is
                                Euclidean distance across the five fingerprint
                                dimensions.
                            </p>
                        </div>
                    </div>
                    <LeaderboardTable
                        report={report}
                        highlightedId={highlightedId}
                        onHighlight={setHighlightedId}
                    />
                </section>

                <section className="ipd-section" aria-label="Fingerprint dimensions">
                    <div className="ipd-section-head">
                        <div>
                            <h2>Fingerprint dimensions</h2>
                            <p>
                                The measurement frame follows Axelrod: not just
                                who won, but how each player behaved.
                            </p>
                        </div>
                    </div>
                    <div className="ipd-dims">
                        {dimCards.map((metric) => (
                            <article key={metric.id} className="ipd-dim-card">
                                <h3>{metric.label}</h3>
                                <p>{metric.description}</p>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
