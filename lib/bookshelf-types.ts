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
    role: SpineRole;
    /** Spine thickness (from page count, may grow for long titles). */
    widthPx: number;
    /** Upright book height / lying book length (grows to fit title + author). */
    heightPx: number;
    clusterId: number;
    clusterPosition: number;
};

/** Typical upright spine height (px); individual books vary a little around this. */
export const SPINE_HEIGHT_PX = 168;

/** Soft bounds for base height jitter before text-fitting. */
export const SPINE_HEIGHT_MIN_PX = 138;
export const SPINE_HEIGHT_SOFT_MAX_PX = 200;

/** Absolute max upright height when growing to fit long titles. */
export const SPINE_HEIGHT_MAX_PX = 240;

/** Max pile thickness for a horizontal stack (sum of book widths). */
export const STACK_PILE_MAX_PX = 182;

/** Exactly three planks on the home bookshelf. */
export const SHELF_ROW_COUNT = 3;
