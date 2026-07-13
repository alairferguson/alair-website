// Ported from the real 75hard-website app (honeycomb + habit color system).

export const TOTAL_DAYS = 75;
export const COMPLETED_DAYS = 20;
/** Day 0 is a preview day shown unchecked, so visitors can see what an incomplete day looks like. */
export const MIN_DAY = 0;
const ROW_COUNTS = [13, 12, 13, 12, 13, 12];

export function hexagonPoints(cx: number, cy: number, r: number): string {
    const w = r;
    const h = (r * Math.sqrt(3)) / 2;
    const points = [
        [cx + w, cy],
        [cx + w / 2, cy + h],
        [cx - w / 2, cy + h],
        [cx - w, cy],
        [cx - w / 2, cy - h],
        [cx + w / 2, cy - h],
    ];
    return points.map(([x, y]) => `${x},${y}`).join(" ");
}

const size = 11;
const width = 2 * size;
const sideLength = size;
const stepX = width + sideLength;
const halfHeight = (size * Math.sqrt(3)) / 2;
const stepY = halfHeight;
const offsetX = stepX / 2;
export const hexSize = size;

export const honeycombDayLabelFontSize = 7;
export const honeycombEmptyFill = "#d4d4d4";
export const honeycombLabelOnEmpty = "#000000";
export const honeycombLabelOnFilled = "#ffffff";

export type HoneycombCell = { day: number; cx: number; cy: number };

export function getHoneycombCells(): HoneycombCell[] {
    const positions: { cx: number; cy: number }[] = [];
    for (let row = 0; row < ROW_COUNTS.length; row++) {
        const count = ROW_COUNTS[row];
        const rowOffsetX = row % 2 === 0 ? 0 : offsetX;
        const cy = row * stepY;
        for (let col = 0; col < count; col++) {
            positions.push({ cx: rowOffsetX + col * stepX, cy });
        }
    }
    const sorted = [...positions].sort((a, b) => (a.cx === b.cx ? a.cy - b.cy : a.cx - b.cx));
    return sorted.map((pos, i) => ({ day: i + 1, ...pos }));
}

const renderRadius = hexSize - 0.5;

export function getViewBox(): string {
    const cells = getHoneycombCells();
    const halfH = (renderRadius * Math.sqrt(3)) / 2;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const { cx, cy } of cells) {
        minX = Math.min(minX, cx - renderRadius);
        maxX = Math.max(maxX, cx + renderRadius);
        minY = Math.min(minY, cy - halfH);
        maxY = Math.max(maxY, cy + halfH);
    }
    const pad = 2;
    const w = maxX - minX + pad * 2;
    const h = maxY - minY + pad * 2;
    return `${minX - pad} ${minY - pad} ${w} ${h}`;
}

/** Order matches task cards: wedge index 0 = top, clockwise. */
export const HABIT_ORDER = ["read", "workout1", "workout2", "diet", "water", "progressPhoto"] as const;
export type HabitTaskKey = (typeof HABIT_ORDER)[number];

export const HABIT_HEX: Record<HabitTaskKey, string> = {
    water: "#b8d4f8",
    workout1: "#ffd0a8",
    workout2: "#ffeeaa",
    diet: "#b8e8c8",
    read: "#f0b4b4",
    progressPhoto: "#d8c4f0",
};

export const HABIT_RAINBOW_CONIC = [
    "conic-gradient(from 0deg at 50% 50%,",
    "hsl(355 78% 74% / 0.44),",
    "hsl(28 88% 72% / 0.44),",
    "hsl(48 92% 71% / 0.44),",
    "hsl(128 58% 68% / 0.44),",
    "hsl(218 72% 70% / 0.44),",
    "hsl(278 65% 73% / 0.44),",
    "hsl(355 78% 74% / 0.44))",
].join(" ");

export const HABIT_HEX_CLIP_PATH = "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)";

/** The site-wide `h1,h2,... { font-family: var(--font-heading); font-style: italic }` rule is
 * unlayered so it beats Tailwind utilities. Inline style is the only reliable opt-out. */
export const sansHeading: React.CSSProperties = {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontStyle: "normal",
};
