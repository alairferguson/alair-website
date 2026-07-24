"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
import FingerprintScatter, { PROJECTIONS } from "./FingerprintScatter";
import LeaderboardTable from "./LeaderboardTable";
import PayoffMatrix from "./PayoffMatrix";
import PersonaScoreBar from "./PersonaScoreBar";
import PersonaSlope from "./PersonaSlope";
import PlayersGrid from "./PlayersGrid";
import ProseSection from "./ProseSection";
import SlottedSection from "./SlottedSection";
import type { MetricId, Report } from "./types";
import "./report.css";

type Props = {
    report: Report;
};

type FigureActionDetail = {
    target: string;
    action: string;
};

export default function ReportClient({ report }: Props) {
    const [xMetric, setXMetric] = useState<MetricId>(
        report.meta.defaultAxes.x,
    );
    const [yMetric, setYMetric] = useState<MetricId>(
        report.meta.defaultAxes.y,
    );
    const [customAxesOpen, setCustomAxesOpen] = useState(false);
    const [filter, setFilter] = useState<"all" | "llm" | "classic">("all");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    useEffect(() => {
        function onFigureAction(event: Event) {
            const { target, action } = (event as CustomEvent<FigureActionDetail>)
                .detail;
            if (target !== "strategy-space") return;

            if (action === "custom") {
                setCustomAxesOpen(true);
                return;
            }

            const projection = PROJECTIONS.find((p) => p.id === action);
            if (!projection) return;
            setXMetric(projection.x);
            setYMetric(projection.y);
            setCustomAxesOpen(false);
        }

        window.addEventListener("ipd:figure-action", onFigureAction);
        return () => {
            window.removeEventListener("ipd:figure-action", onFigureAction);
        };
    }, []);

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
                    <Link href="/#about" className="ipd-byline">
                        Alair Ferguson Hautzinger
                    </Link>
                </header>

                <ProseSection id="introduction" {...INTRODUCTION} />

                <SlottedSection
                    id="methodology"
                    {...METHODOLOGY}
                    slots={{
                        "the-tournament": <PayoffMatrix />,
                        "llm-persona-players": [
                            <div className="ipd-prompt-grid" key="prompt-cards">
                                {PERSONA_PROMPTS.map((persona) => (
                                    <article
                                        key={persona.id}
                                        className="ipd-prompt-card"
                                    >
                                        <h3>{persona.label}</h3>
                                        <pre className="ipd-mono">
                                            {persona.systemPrompt}
                                        </pre>
                                    </article>
                                ))}
                            </div>,
                            <PlayersGrid key="players-grid" />,
                        ],
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
                                    customOpen={customAxesOpen}
                                    onCustomOpenChange={setCustomAxesOpen}
                                />
                                <p className="ipd-footnote">
                                    Classics are circles; LLM × persona
                                    variants are stars, colored by model (see
                                    the key above).
                                </p>
                            </>
                        ),
                        "cooperation-matrix": (
                            <CooperationHeatmap
                                report={report}
                                highlightedId={highlightedId}
                                onHighlight={setHighlightedId}
                            />
                        ),
                        leaderboard: [
                            <>
                                <LeaderboardTable
                                    report={report}
                                    highlightedId={highlightedId}
                                    onHighlight={setHighlightedId}
                                />
                                <p className="ipd-footnote">
                                    Ranked by mean score per turn across
                                    repetitions. Nearest classic is Euclidean
                                    distance across the five fingerprint
                                    dimensions.
                                </p>
                            </>,
                            <>
                                <p className="ipd-kicker ipd-mono ipd-results-label ipd-results-label--spaced">
                                    Score by Persona
                                </p>
                                <PersonaScoreBar
                                    report={report}
                                    highlightedId={highlightedId}
                                    onHighlight={setHighlightedId}
                                />
                                <p className="ipd-footnote">
                                    Bar height is each persona's mean score
                                    per turn, averaged across its five models;
                                    circles are the individual models,
                                    colored by model (see the key above).
                                </p>
                            </>,
                        ],
                    }}
                />

                <SlottedSection
                    id="discussion"
                    {...DISCUSSION}
                    slots={{
                        "the-persona-slope": (
                            <div id="persona-slope">
                                <PersonaSlope
                                    report={report}
                                    highlightedId={highlightedId}
                                    onHighlight={setHighlightedId}
                                />
                            </div>
                        ),
                    }}
                />
                <ProseSection id="limitations" {...LIMITATIONS} />
                <ProseSection id="conclusion" {...CONCLUSION} />
                <AppendixSection
                    id="appendix"
                    {...APPENDIX}
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
