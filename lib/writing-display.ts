/** Client-safe utilities for displaying writing content (no Node.js imports) */

export function formatDateDDMMYYYY(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}.${day}.${year}`;
}

const SECTIONS: { id: string; label: string; order: number }[] = [
    { id: "projects", label: "01 Projects", order: 1 },
    { id: "thought-pieces", label: "02 Thought Pieces", order: 2 },
    { id: "undergraduate-research", label: "03 Undergraduate Research", order: 3 },
];

/**
 * Writing-list entries that live outside content/writing (PDFs, rabbit-hole
 * projects). Optional `href` overrides the default `/writing/${slug}` link.
 */
export const LINKED_PIECES: {
    slug: string;
    title: string;
    date: string;
    section: string;
    href?: string;
}[] = [
    {
        slug: "llm-axelrod-tournament",
        title: "Is Strategy a System Prompt? An LLM Axelrod Tournament",
        date: "7/20/2026",
        section: "projects",
        href: "/rabbit-holes/llm-axelrod-tournament",
    },
    {
        slug: "ECN_378.pdf",
        title: "Impact of the Food Modernization Act on Market Structure: Evidence from the Corn Industry",
        date: "5/15/2025",
        section: "undergraduate-research",
    },
    {
        slug: "ECN395_Final Paper_AFH.pdf",
        title: "Inequality and Education Pre- and Post- the Brazilian Neoliberal 1990s",
        date: "12/15/2024",
        section: "undergraduate-research",
    },
    {
        slug: "game_theory.pdf",
        title: "Brexit as a Bargaining Game: Static and Dynamic Models of UK–EU Trade Negotiations",
        date: "5/1/2024",
        section: "undergraduate-research",
    },
];

export function getWritingSections(): { id: string; label: string; order: number }[] {
    return SECTIONS;
}
