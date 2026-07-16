"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
    APPENDIX,
    CONCLUSION,
    CREDITS,
    DISCUSSION,
    INTRODUCTION,
    LIMITATIONS,
    METHODOLOGY,
    PERSONA_PROMPTS,
    USER_PROMPT_EXAMPLES,
} from "./content";
import AppendixSection from "./AppendixSection";
import FingerprintScatter from "./FingerprintScatter";
import LeaderboardTable from "./LeaderboardTable";
import MethodologySection from "./MethodologySection";
import PayoffMatrix from "./PayoffMatrix";
import PersonaSlope from "./PersonaSlope";
import ProseSection from "./ProseSection";
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

                <ProseSection id="introduction" {...INTRODUCTION} />

                <MethodologySection
                    id="methodology"
                    {...METHODOLOGY}
                    slots={{
                        "the-tournament": <PayoffMatrix />,
                        "llms-nearest-classic-strategy": (
                            <div className="ipd-dims-wrap">
                                <p className="ipd-kicker ipd-mono ipd-results-label">
                                    Fingerprint dimensions
                                </p>
                                <div className="ipd-dims">
                                    {dimCards.map((metric) => (
                                        <article
                                            key={metric.id}
                                            className="ipd-dim-card"
                                        >
                                            <h3>{metric.label}</h3>
                                            <p>{metric.description}</p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        ),
                    }}
                />

                <section
                    className="ipd-section ipd-section--numbered"
                    id="results"
                    aria-label="Results"
                >
                    <div className="ipd-section-head">
                        <div>
                            <h2>Results</h2>
                            <p>
                                Every player placed in strategy space, ranked by
                                outcome, matched to its nearest classic, then
                                read through the persona knob.
                            </p>
                        </div>
                    </div>

                    <div id="strategy-space">
                        <p className="ipd-kicker ipd-mono ipd-results-label">
                            Strategy space
                        </p>
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
                    </div>
                    <p className="ipd-footnote">
                        Classics are circles; LLM × persona variants are stars.
                        Lines connect personas of the same model. Hover a point
                        or table row to inspect the fingerprint; switch axes to
                        re-project strategy space.
                    </p>

                    <p className="ipd-kicker ipd-mono ipd-results-label ipd-results-label--spaced">
                        Leaderboard
                    </p>
                    <LeaderboardTable
                        report={report}
                        highlightedId={highlightedId}
                        onHighlight={setHighlightedId}
                    />
                    <p className="ipd-footnote">
                        Ranked by mean score per turn. Nearest classic is
                        Euclidean distance across the five fingerprint
                        dimensions.
                    </p>

                    <p className="ipd-kicker ipd-mono ipd-results-label ipd-results-label--spaced">
                        Persona knob
                    </p>
                    <PersonaSlope
                        report={report}
                        highlightedId={highlightedId}
                        onHighlight={setHighlightedId}
                    />
                    <p className="ipd-footnote">
                        Four system prompts, same models, temperature 0. Switch
                        metrics to see which fingerprint traits the disposition
                        moves; overlay the curves to compare swings directly.
                    </p>
                </section>

                <ProseSection id="discussion" {...DISCUSSION} />
                <ProseSection id="limitations" {...LIMITATIONS} />
                <ProseSection id="conclusion" {...CONCLUSION} />
                <AppendixSection
                    id="appendix"
                    {...APPENDIX}
                    personaPrompts={PERSONA_PROMPTS}
                    userPromptExamples={USER_PROMPT_EXAMPLES}
                />

                <footer className="ipd-footer ipd-mono">
                    {CREDITS.paragraphs.map((text, i) => (
                        <p key={i}>{text}</p>
                    ))}
                </footer>
            </div>
        </div>
    );
}
