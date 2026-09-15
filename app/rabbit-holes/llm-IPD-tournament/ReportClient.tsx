"use client";

import Link from "next/link";
import SectionNav, { type NavItem } from "./SectionNav";
import type { Report } from "./types";
import "./report.css";
import { CustomLink, ReportProvider } from "./figures";
import ReportMdx from "./report_vfinal.mdx";

type Props = {
    report: Report;
};

const NAV_ITEMS: NavItem[] = [
    { id: "introduction", label: "The Question" },
    { id: "methodology", label: "How The Tournament Worked" },
    { id: "how-they-played", label: "How LLMs Played Under Different Conditions" },
    { id: "limitations", label: "What This Doesn't Show" },
    { id: "conclusion", label: "What I Took Away" },
    { id: "appendix", label: "Appendix" },
];

export default function ReportClient({ report }: Props) {
    return (
        <div className="ipd-report">
            <SectionNav items={NAV_ITEMS} />
            <div className="ipd-shell">
                <div className="ipd-topbar">
                    <Link href="/#rabbit-holes" className="ipd-back ipd-mono">
                        ← Rabbit holes
                    </Link>
                </div>

                <header className="ipd-hero">
                    <h1>{report.title}</h1>
                    <p>{report.subtitle}</p>
                    <div className="ipd-hero-links">
                        <Link href="/#about" className="ipd-byline">
                            Alair Ferguson Hautzinger
                        </Link>
                        <span aria-hidden="true">·</span>
                        <a
                            href="https://github.com/alairferguson/axelrod-tourn"
                            className="ipd-byline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub Repo
                        </a>
                    </div>
                </header>

                <ReportProvider report={report}>
                    <ReportMdx components={{ a: CustomLink }} />
                </ReportProvider>
            </div>
        </div>
    );
}
