import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { withCanonicalColors } from "./colors";
import ReportClient from "./ReportClient";
import type { Report } from "./types";

const sourceSerif = Source_Serif_4({
    subsets: ["latin"],
    variable: "--ipd-font-serif",
    display: "swap",
});

const plexSans = IBM_Plex_Sans({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--ipd-font-sans",
    display: "swap",
});

const plexMono = IBM_Plex_Mono({
    subsets: ["latin"],
    weight: ["400", "500"],
    variable: "--ipd-font-mono",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Do LLMs Hold Grudges? | Alair",
    description:
        "Evidence from a 27-player Axelrod tournament pitting language models against classic game theory strategies.",
};

async function loadReport(): Promise<Report> {
    const filePath = path.join(
        process.cwd(),
        "public/rabbit-holes/llm-axelrod-tournament/report.json",
    );
    const raw = await readFile(filePath, "utf8");
    return withCanonicalColors(JSON.parse(raw) as Report);
}

export default async function LlmAxelrodTournamentPage() {
    const report = await loadReport();

    return (
        <div
            className={`${sourceSerif.variable} ${plexSans.variable} ${plexMono.variable}`}
        >
            <ReportClient report={report} />
        </div>
    );
}
