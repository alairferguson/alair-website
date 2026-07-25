export type SpineRole = "upright" | "stack-base";

export type Spine = {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    link: string;
    rating: number | null;
    pages: number | null;
    color: string;
    textColor: "dark" | "ivory";
    /** Cover-art border color(s) — hand-picked per book (usually one, rarely a stacked few), falls back to the spine's own color. */
    borderColors: string[];
    role: SpineRole;
    /** Spine thickness (from page count, may grow for long titles). */
    widthPx: number;
    /** Upright book height / lying book length (grows to fit title + author). */
    heightPx: number;
    /** Cover thumbnail height — clamped to a book-like aspect ratio of widthPx, never a random sliver or slab. */
    coverHeightPx: number;
    /** Exact height of the title+author block — any leftover spine height becomes a spacer above the cover. */
    textBlockHeightPx: number;
    clusterId: number;
    clusterPosition: number;
};

/** Typical upright spine height (px); individual books vary a little around this. */
export const SPINE_HEIGHT_PX = 168;

/** Soft bounds for base height jitter before text-fitting — wide spread for shelf variety. */
export const SPINE_HEIGHT_MIN_PX = 118;
export const SPINE_HEIGHT_SOFT_MAX_PX = 230;

/** Absolute max upright height when growing to fit long titles. */
export const SPINE_HEIGHT_MAX_PX = 260;

/** Max pile thickness for a horizontal stack (sum of book widths). */
export const STACK_PILE_MAX_PX = 280;

/** Two planks on the home bookshelf — everything packs into these. */
export const SHELF_ROW_COUNT = 2;

/**
 * Title font size from spine thickness (author renders one size down). Shared
 * between the sizing math (bookshelf.ts) and the actual rendering (Spine.tsx)
 * so the two can't drift apart — sizing has to know the real font size to
 * predict text height accurately.
 */
export function titleFontSizePx(widthPx: number): number {
    return Math.max(10, Math.min(12, widthPx * 0.22));
}

export function authorFontSizePx(titleFontSize: number): number {
    return Math.max(9, titleFontSize - 1);
}
