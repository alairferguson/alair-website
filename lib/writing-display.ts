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
    { id: "profile", label: "04 Profile", order: 4 },
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
    credit?: string;
}[] = [
    {
        slug: "llm-axelrod-tournament",
        title: "Is Strategy a System Prompt? An LLM Axelrod Tournament",
        date: "7/20/2026",
        section: "projects",
        href: "/rabbit-holes/llm-axelrod-tournament",
    },
    {
        slug: "mcgavock-novak-fgc-weather-shocks",
        credit: "Acknowledged research assistant — Tamara McGavock & Lindsey Novak:",
        title: "Now, Later, or Never? Evidence of the Effect of Weather Shocks on Female Genital Cutting in Sub-Saharan Africa",
        date: "10/1/2023",
        section: "undergraduate-research",
        href: "https://www.sciencedirect.com/science/article/abs/pii/S0304387823001244",
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
    {
        slug: "scarlet-and-black-senior-profile",
        title: "The Scarlet and Black: Alair Ferguson Hautzinger",
        date: "5/4/2025",
        section: "profile",
        href: "https://thesandb.com/51567/senior-issue-2025/alair-ferguson-hautzinger/",
    },
];

export function getWritingSections(): { id: string; label: string; order: number }[] {
    return SECTIONS;
}
