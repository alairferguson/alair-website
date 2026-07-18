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
    RESULTS,
    USER_PROMPT_EXAMPLES,
} from "./content";
import AppendixSection from "./AppendixSection";
import CooperationHeatmap from "./CooperationHeatmap";
import FingerprintScatter from "./FingerprintScatter";
import LeaderboardTable from "./LeaderboardTable";
import PayoffMatrix from "./PayoffMatrix";
import PersonaSlope from "./PersonaSlope";
import ProseSection from "./ProseSection";
import SlottedSection from "./SlottedSection";
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

                <SlottedSection
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

                <SlottedSection
                    id="results"
                    {...RESULTS}
                    slots={{
                        "strategy-space": (
                            <>
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
                                    Classics are circles; LLM × persona
                                    variants are stars. Lines connect personas
                                    of the same model. Plot labels are
                                    abbreviated — hover a point for the full
                                    name. Use Behavior, Punishment, or Outcome
                                    to re-project; Custom axes for any pair.
                                </p>
                            </>
                        ),
                        "cooperation-matrix": (
                            <>
                                <CooperationHeatmap
                                    report={report}
                                    highlightedId={highlightedId}
                                    onHighlight={setHighlightedId}
                                />
                                <p className="ipd-footnote">
                                    Each cell is how often the row player
                                    cooperated against the column player.
                                    Switch to LLMs × LLMs for model-to-model
                                    play; Full matrix includes every pairing.
                                    Hover shows both directions when the
                                    matchup is asymmetric.
                                </p>
                            </>
                        ),
                        leaderboard: (
                            <>
                                <LeaderboardTable
                                    report={report}
                                    highlightedId={highlightedId}
                                    onHighlight={setHighlightedId}
                                />
                                <p className="ipd-footnote">
                                    Ranked by mean score per turn. Nearest
                                    classic is Euclidean distance across the
                                    five fingerprint dimensions.
                                </p>
                            </>
                        ),
                        "persona-knob": (
                            <>
                                <PersonaSlope
                                    report={report}
                                    highlightedId={highlightedId}
                                    onHighlight={setHighlightedId}
                                />
                                <p className="ipd-footnote">
                                    Four system prompts, same models,
                                    temperature 0. Switch metrics to see which
                                    fingerprint traits the disposition moves;
                                    overlay the curves to compare swings
                                    directly.
                                </p>
                            </>
                        ),
                    }}
                />

                <SlottedSection
                    id="discussion"
                    {...DISCUSSION}
                    slots={{
                        "the-persona-knob": (
                            <PersonaSlope
                                report={report}
                                highlightedId={highlightedId}
                                onHighlight={setHighlightedId}
                            />
                        ),
                    }}
                />
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
