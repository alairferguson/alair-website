"use client";

import {
    Children,
    createContext,
    isValidElement,
    useContext,
    useEffect,
    useMemo,
    useState,
    type AnchorHTMLAttributes,
    type ReactNode,
} from "react";
import CooperationHeatmapBase, {
    type HeatmapSortMode,
    type HeatmapViewMode,
} from "./CooperationHeatmap";
import FingerprintScatterBase, { PROJECTIONS } from "./FingerprintScatter";
import LeaderboardTableBase from "./LeaderboardTable";
import PayoffMatrix from "./PayoffMatrix";
import PersonaScoreBarBase from "./PersonaScoreBar";
import PersonaSlopeBase from "./PersonaSlope";
import PlayersGrid from "./PlayersGrid";
import { PERSONA_PROMPTS, USER_PROMPT_EXAMPLES } from "./prompts";
import type { MetricId, Report } from "./types";

export { PayoffMatrix, PlayersGrid };

type Filter = "all" | "llm" | "classic";

type ReportContextValue = {
    report: Report;
    xMetric: MetricId;
    setXMetric: (id: MetricId) => void;
    yMetric: MetricId;
    setYMetric: (id: MetricId) => void;
    customAxesOpen: boolean;
    setCustomAxesOpen: (open: boolean) => void;
    filter: Filter;
    setFilter: (filter: Filter) => void;
    highlightedId: string | null;
    setHighlightedId: (id: string | null) => void;
    heatmapView: HeatmapViewMode;
    setHeatmapView: (view: HeatmapViewMode) => void;
    heatmapSort: HeatmapSortMode;
    setHeatmapSort: (sort: HeatmapSortMode) => void;
};

const ReportContext = createContext<ReportContextValue | null>(null);

function useReportContext(): ReportContextValue {
    const ctx = useContext(ReportContext);
    if (!ctx) {
        throw new Error("Axelrod figure used outside <ReportProvider>");
    }
    return ctx;
}

type FigureActionDetail = { target: string; action: string };

export function ReportProvider({
    report,
    children,
}: {
    report: Report;
    children: ReactNode;
}) {
    const [xMetric, setXMetric] = useState<MetricId>(report.meta.defaultAxes.x);
    const [yMetric, setYMetric] = useState<MetricId>(report.meta.defaultAxes.y);
    const [customAxesOpen, setCustomAxesOpen] = useState(false);
    const [filter, setFilter] = useState<Filter>("all");
    const [highlightedId, setHighlightedId] = useState<string | null>(null);
    const [heatmapView, setHeatmapView] = useState<HeatmapViewMode>("llm-classic");
    const [heatmapSort, setHeatmapSort] = useState<HeatmapSortMode>("model");

    useEffect(() => {
        function onFigureAction(event: Event) {
            const { target, action } = (event as CustomEvent<FigureActionDetail>)
                .detail;

            if (target === "strategy-space") {
                if (action === "custom") {
                    setCustomAxesOpen(true);
                    return;
                }
                const projection = PROJECTIONS.find((p) => p.id === action);
                if (!projection) return;
                setXMetric(projection.x);
                setYMetric(projection.y);
                setCustomAxesOpen(false);
                return;
            }

            if (target === "cooperation-matrix") {
                if (action === "full") {
                    setHeatmapView("full");
                    return;
                }
                if (action === "llms-classics" || action === "llm-classic") {
                    setHeatmapView("llm-classic");
                    return;
                }
                if (action === "persona" || action === "model") {
                    setHeatmapSort(action);
                    setHeatmapView("llm-classic");
                }
            }
        }

        window.addEventListener("ipd:figure-action", onFigureAction);
        return () => {
            window.removeEventListener("ipd:figure-action", onFigureAction);
        };
    }, []);

    const value = useMemo<ReportContextValue>(
        () => ({
            report,
            xMetric,
            setXMetric,
            yMetric,
            setYMetric,
            customAxesOpen,
            setCustomAxesOpen,
            filter,
            setFilter,
            highlightedId,
            setHighlightedId,
            heatmapView,
            setHeatmapView,
            heatmapSort,
            setHeatmapSort,
        }),
        [
            report,
            xMetric,
            yMetric,
            customAxesOpen,
            filter,
            highlightedId,
            heatmapView,
            heatmapSort,
        ],
    );

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function Figure({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
Object.assign(Figure, { isFigure: true });

function isFigureNode(item: ReactNode): boolean {
    return (
        isValidElement(item) &&
        typeof item.type !== "string" &&
        (item.type === Figure ||
            (item.type as { isFigure?: boolean }).isFigure === true)
    );
}

export function Section({
    id,
    title,
    dek,
    children,
}: {
    id: string;
    title: string;
    dek?: string;
    children: ReactNode;
}) {
    return (
        <section className="ipd-section ipd-section--numbered" id={id} aria-label={title}>
            <div className="ipd-section-head">
                <div>
                    <h2>{title}</h2>
                    {dek && <p>{dek}</p>}
                </div>
            </div>
            <div className="ipd-prose">{children}</div>
        </section>
    );
}

export function SlottedSection({
    id,
    title,
    dek,
    children,
}: {
    id: string;
    title: string;
    dek?: string;
    children: ReactNode;
}) {
    return (
        <section className="ipd-section ipd-section--numbered" id={id} aria-label={title}>
            <div className="ipd-section-head">
                <div>
                    <h2>{title}</h2>
                    {dek && <p>{dek}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

export function Subsection({ id, children }: { id: string; children: ReactNode }) {
    const items = Children.toArray(children).filter((item) => {
        if (item == null || typeof item === "boolean") return false;
        if (typeof item === "string") return item.trim().length > 0;
        return true;
    });
    const segments: Array<{ type: "prose" | "slot"; nodes: ReactNode[] }> = [];

    for (const item of items) {
        const isFigure = isFigureNode(item);
        const last = segments[segments.length - 1];
        if (isFigure) {
            segments.push({ type: "slot", nodes: [item] });
        } else if (last && last.type === "prose") {
            last.nodes.push(item);
        } else {
            segments.push({ type: "prose", nodes: [item] });
        }
    }

    return (
        <div className="ipd-subsection" id={id}>
            {segments.map((seg, i) =>
                seg.type === "slot" ? (
                    <div className="ipd-slot" key={i}>
                        {seg.nodes}
                    </div>
                ) : (
                    <div className="ipd-prose" key={i}>
                        {seg.nodes}
                    </div>
                ),
            )}
        </div>
    );
}

export function CustomLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
    const { href = "", children, ...rest } = props;

    if (href.startsWith("#hover:")) {
        const raw = href.slice("#hover:".length);
        const colon = raw.indexOf(":");
        const target = colon === -1 ? raw : raw.slice(0, colon);
        const action = colon === -1 ? null : raw.slice(colon + 1);
        return (
            <span
                className="ipd-prose-hover"
                onMouseEnter={() => {
                    if (!action) return;
                    window.dispatchEvent(
                        new CustomEvent("ipd:figure-hover", { detail: { target, action } }),
                    );
                }}
                onMouseLeave={() => {
                    window.dispatchEvent(
                        new CustomEvent("ipd:figure-hover-end", { detail: { target } }),
                    );
                }}
            >
                {children}
            </span>
        );
    }

    const isAnchor = href.startsWith("#");
    return (
        <a
            {...rest}
            href={href}
            target={isAnchor ? undefined : "_blank"}
            rel={isAnchor ? undefined : "noopener noreferrer"}
            className="ipd-prose-link"
            onClick={
                isAnchor
                    ? (e) => {
                          e.preventDefault();
                          const raw = href.slice(1);
                          const colon = raw.indexOf(":");
                          const id = colon === -1 ? raw : raw.slice(0, colon);
                          const action = colon === -1 ? null : raw.slice(colon + 1);
                          if (action) {
                              window.dispatchEvent(
                                  new CustomEvent("ipd:figure-action", {
                                      detail: {
                                          target: id || "strategy-space",
                                          action,
                                      },
                                  }),
                              );
                          }
                          if (id) {
                              const scrollTarget = document.getElementById(id);
                              if (scrollTarget) {
                                  scrollTarget.scrollIntoView({
                                      behavior: "smooth",
                                      block: "start",
                                  });
                              }
                          }
                      }
                    : undefined
            }
        >
            {children}
        </a>
    );
}

export function LeaderboardTable() {
    const { report, highlightedId, setHighlightedId } = useReportContext();
    return (
        <>
            <LeaderboardTableBase
                report={report}
                highlightedId={highlightedId}
                onHighlight={setHighlightedId}
            />
            <p className="ipd-footnote">
                Ranked by mean score per turn across repetitions. Nearest classic is
                Euclidean distance across the five fingerprint dimensions.
            </p>
        </>
    );
}

export function FingerprintScatter() {
    const {
        report,
        xMetric,
        setXMetric,
        yMetric,
        setYMetric,
        filter,
        setFilter,
        highlightedId,
        setHighlightedId,
        customAxesOpen,
        setCustomAxesOpen,
    } = useReportContext();
    return (
        <>
            <FingerprintScatterBase
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
                Classics are circles; LLM × persona variants are stars, colored by
                model (see the key above).
            </p>
        </>
    );
}

export function CooperationHeatmap() {
    const {
        report,
        highlightedId,
        setHighlightedId,
        heatmapView,
        setHeatmapView,
        heatmapSort,
        setHeatmapSort,
    } = useReportContext();
    return (
        <CooperationHeatmapBase
            report={report}
            highlightedId={highlightedId}
            onHighlight={setHighlightedId}
            view={heatmapView}
            onViewChange={setHeatmapView}
            sortMode={heatmapSort}
            onSortModeChange={setHeatmapSort}
        />
    );
}

export function PersonaScoreBar() {
    const { report, highlightedId, setHighlightedId } = useReportContext();
    return (
        <div className="ipd-score-wrap">
            <PersonaScoreBarBase
                report={report}
                highlightedId={highlightedId}
                onHighlight={setHighlightedId}
            />
            <p className="ipd-footnote">
                Bar height is each persona&apos;s mean score per turn, averaged
                across its five models; circles are the individual models,
                colored by model.
            </p>
        </div>
    );
}

export function PersonaSlope() {
    const { report, highlightedId, setHighlightedId } = useReportContext();
    return (
        <div id="persona-slope">
            <PersonaSlopeBase
                report={report}
                highlightedId={highlightedId}
                onHighlight={setHighlightedId}
            />
        </div>
    );
}

export function DimensionCards() {
    const { report } = useReportContext();
    const dimCards = report.metrics.filter((m) => m.id !== "mean_score_per_turn");
    return (
        <div className="ipd-dims-wrap">
            <p className="ipd-kicker ipd-mono ipd-results-label">
                Fingerprint dimensions
            </p>
            <div className="ipd-dims">
                {dimCards.map((metric) => (
                    <article key={metric.id} className="ipd-dim-card">
                        <h3>{metric.label}</h3>
                        <p>{metric.description}</p>
                    </article>
                ))}
            </div>
        </div>
    );
}

export function PersonaPromptCards() {
    return (
        <div className="ipd-prompt-grid">
            {PERSONA_PROMPTS.map((persona) => (
                <article key={persona.id} className="ipd-prompt-card">
                    <h3>{persona.label}</h3>
                    <pre className="ipd-mono">{persona.systemPrompt}</pre>
                </article>
            ))}
        </div>
    );
}

export function UserPromptCards() {
    return (
        <div>
            <p
                id="appendix-user-prompts"
                className="ipd-kicker ipd-mono ipd-results-label"
            >
                User prompt (per turn)
            </p>
            <div className="ipd-prompt-grid">
                {USER_PROMPT_EXAMPLES.map((example) => (
                    <article key={example.id} className="ipd-prompt-card">
                        <h3>{example.label}</h3>
                        <pre className="ipd-mono">{example.body}</pre>
                    </article>
                ))}
            </div>
        </div>
    );
}
