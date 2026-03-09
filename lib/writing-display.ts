/** Client-safe utilities for displaying writing content (no Node.js imports) */

export function formatDateDDMMYYYY(dateStr: string): string {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}.${day}.${year}`;
}

const SECTIONS: { id: string; label: string; order: number }[] = [
    { id: "thought-pieces", label: "01 Thought Pieces", order: 1 },
    { id: "undergraduate-research", label: "02 Undergraduate Research", order: 2 },
];

/** PDF pieces (not MDX) - served from public/writing/ */
export const PDF_PIECES: { slug: string; title: string; date: string; section: string }[] = [
    {
        slug: "ECN395_Final Paper_AFH",
        title: "Inequality and Education Pre- and Post- the Brazilian Neoliberal 1990s",
        date: "12/15/2024",
        section: "undergraduate-research",
    },
];

export function getWritingSections(): { id: string; label: string; order: number }[] {
    return SECTIONS;
}
