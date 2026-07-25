import { fetchShelf, type Book } from "./goodreads";
import { findCoverOverrides } from "./bookshelf-covers";
import { spineColorFromHex, vividColorFromFile, vividColorFromImage } from "./spine-color";
import {
    authorFontSizePx,
    SPINE_HEIGHT_MAX_PX,
    SPINE_HEIGHT_MIN_PX,
    SPINE_HEIGHT_PX,
    SPINE_HEIGHT_SOFT_MAX_PX,
    titleFontSizePx,
    type Spine,
    type SpineRole,
} from "./bookshelf-types";

export type { Spine, SpineRole } from "./bookshelf-types";
export { SPINE_HEIGHT_PX };

/** Curated Goodreads shelf for this site. */
export const BOOKSHELF_SHELF = "alair-website" as const;

const GOODREADS_USER_ID = "170463989";

type RoleAssignment = {
    role: SpineRole;
    clusterId: number;
    clusterPosition: number;
};

/** Deterministic 0–1 from an id (same char-code hash idea as PhotoStack's tiltForSlug). */
function hash01(id: string, salt = 0): number {
    let hash = salt;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) % 1000;
    }
    return hash / 1000;
}

function clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
}

function mapRange(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    const t = (value - inMin) / (inMax - inMin);
    return outMin + clamp(t, 0, 1) * (outMax - outMin);
}

function widthFromPages(pages: number | null): number {
    return clamp(mapRange(pages ?? 300, 150, 700, 34, 64), 34, 64);
}

/** Subtle per-book height jitter (deterministic from id). */
function heightFromId(id: string): number {
    return Math.round(
        SPINE_HEIGHT_MIN_PX + hash01(id, 29) * (SPINE_HEIGHT_SOFT_MAX_PX - SPINE_HEIGHT_MIN_PX)
    );
}

const SPINE_FONT_PX = 11;
// Per-character advance as a fraction of font-size, fit against actual rendered text
// (Source Serif, vertical-rl/sideways) — title is font-weight 500, author 400, and the
// bolder weight measurably advances a little wider per character.
const TITLE_CHAR_ADVANCE_FACTOR = 0.47;
const AUTHOR_CHAR_ADVANCE_FACTOR = 0.43;
const SPINE_TITLE_AUTHOR_GAP = 10;
const SPINE_PAD = 10;
const SPINE_WIDTH_MAX = 72;
const SPINE_COL_WIDTH = SPINE_FONT_PX + 5;
/**
 * Cover thumbnail height, as a multiple of the spine's own width — keeps every
 * cover a believable book-cover rectangle instead of a random sliver or slab.
 * Extra spine height (from the random per-book jitter) that doesn't fit inside
 * this range shows up as blank space above the cover instead of distorting it.
 */
const COVER_ASPECT_MIN = 1.15;
const COVER_ASPECT_MAX = 2.6;

/**
 * "The Testaments (The Handmaid's Tale #2)" → "The Testaments"
 * Strips Goodreads-style series parentheticals that include a #volume.
 */
export function stripSeriesFromTitle(title: string): string {
    return title
        .replace(/\s*\([^)]*#\d+[^)]*\)/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

/** Goodreads book id → shortened spine title, for subtitles too long to fit legibly. */
const TITLE_OVERRIDES: Record<string, string> = {
    "206318561": "Slow Days, Fast Company", // full: "...: The World, the Flesh, and L.A."
    "17465709": "Braiding Sweetgrass", // full: "...: Indigenous Wisdom, Scientific Knowledge, and the Teachings of Plants"
    "45427317": "Antigone", // full: "Antigone de Jean Anouilh (French Edition)"
    "16857": "The Last Tycoon", // full: "The Love of the Last Tycoon" — the novel's better-known title
};

function displayTitle(bookId: string, rawTitle: string): string {
    return TITLE_OVERRIDES[bookId] ?? stripSeriesFromTitle(rawTitle);
}

/**
 * Goodreads book id → hand-picked spine color, overriding the vivid-color pick.
 * Colors either name a plain shade directly, or are sampled from a specific part
 * of that book's cover (noted per entry) at Alair's direction, book by book.
 */
const SPINE_COLOR_OVERRIDES: Record<string, string> = {
    "38447": "#923334", // The Handmaid's Tale — red from the bottom of the cover
    "2767": "#042d4c", // A People's History of the United States — blue of the title text
    "4835": "#e7cf2e", // Haroun and the Sea of Stories — main yellow of the cover
    "2696": "#f0e6d2", // The Canterbury Tales — cream
    "45427317": "#000000", // Antigone — black
    "51113": "#303c14", // The Samurai's Garden — green of the light foliage
    "207293782": "#3a3a3a", // Didion and Babitz — darker grey
    "6969": "#e93884", // Emma — pink
    "23383649": "#e8dcc4", // The Devil's Own Work — dark cream
    "40611328": "#5d5a47", // Ishmael — green of the top banner
    "71872930": "#89c4c3", // North Woods — blue
    "428": "#e9328c", // Play It As It Lays — pink of the top banner
    "206318561": "#f9acb2", // Slow Days, Fast Company — baby pink of the cover
    "49552": "#000000", // The Stranger — black
    "65605": "#1b4d3e", // The Magician's Nephew — deep green
    "60811826": "#c8a2c8", // I Who Have Never Known Men — lavender
};

/**
 * Goodreads book id → hand-picked cover-art border color(s). Usually one color;
 * Slouching Towards Bethlehem gets three, matching its three-stripe title.
 * Falls back to the spine's own color for books not yet assigned one.
 */
const BORDER_COLOR_OVERRIDES: Record<string, string[]> = {
    "41038404": ["#f672ac"], // Les précieuses ridicules — pink from the illustration
    "5129": ["#957b8a"], // Brave New World — purple from the bottom-half photo
    "2696": ["#8f1916"], // The Canterbury Tales — vibrant red robe in the middle of the cover
    "48757": ["#000000"], // The Tao of Pooh — black
    "38447": ["#000000"], // The Handmaid's Tale — black
    "61439040": ["#ffffff"], // 1984 — white
    "15823480": ["#000000"], // Anna Karenina — black
    "2767": ["#8e2410"], // A People's History of the United States — red of the "Howard Zinn" stripe
    "18114322": ["#1c3d2e"], // The Grapes of Wrath — deep forest green
    "9777": ["#f5f1e8"], // The God of Small Things — soft white
    "51113": ["#ffffff"], // The Samurai's Garden — white
    "4835": ["#e8291a"], // Haroun and the Sea of Stories — bright red
    "6514": ["#000000"], // The Bell Jar — black
    "45427317": ["#750c01"], // Antigone — maroon of the figures
    "19380": ["#000000"], // Candide — black
    "207293782": ["#000000"], // Didion and Babitz — black
    "14942": ["#ffffff"], // Mrs. Dalloway — white
    "200776812": ["#000000"], // Butter — black
    "6969": ["#ffffff"], // Emma — white
    "16857": ["#ffffff"], // The Last Tycoon — white
    "23383649": ["#e8291a"], // The Devil's Own Work — bright red
    "40611328": ["#a6151c"], // Ishmael — red of the title
    "71872930": ["#000000"], // North Woods — black
    "428": ["#f7b000"], // Play It As It Lays — neon yellow from the sun
    "40180098": ["#a7d8f0"], // The Overstory — baby blue
    "206318561": ["#d21869"], // Slow Days, Fast Company — hot pink of the cover
    "424": ["#e5006e", "#ec4113", "#fde70a"], // Slouching Towards Bethlehem — the title's three pop colors
    "50998056": ["#ffffff"], // The Ministry for the Future — white
    "17465709": ["#fde9c8"], // Braiding Sweetgrass — cream
    "11297": ["#ffffff"], // Norwegian Wood — white
    "49552": ["#ffffff"], // The Stranger — white
    "42975172": ["#39ff14"], // The Testaments — neon green
    "223688905": ["#001f54"], // Twice — navy blue
    "65605": ["#b8860b"], // The Magician's Nephew — dark yellow
    "60811826": ["#88a375"], // I Who Have Never Known Men — sea foam green
};

/**
 * Sizes a spine so the text block (title + gap + author + padding) is exactly
 * as tall as its own content needs — never more — and the cover thumbnail is
 * always a believable book-cover rectangle (COVER_ASPECT_MIN–MAX × its own
 * width), never a random sliver or slab. Extra spine height (from the random
 * per-book jitter) that doesn't fit in either becomes blank space above the
 * cover, rendered by Spine.tsx as a flex spacer — never distorting the cover
 * or reopening the gap between cover/title/author that used to stretch here.
 * Long names still grow the spine (and, past the cap, its width) same as before.
 */
function sizeForSpineText(
    title: string,
    author: string,
    baseWidth: number,
    baseHeight: number
): { widthPx: number; heightPx: number; coverHeightPx: number; textBlockHeightPx: number } {
    const titleFontSize = titleFontSizePx(baseWidth);
    const authorFontSize = authorFontSizePx(titleFontSize);
    const titleAdvance = titleFontSize * TITLE_CHAR_ADVANCE_FACTOR;
    const authorAdvance = authorFontSize * AUTHOR_CHAR_ADVANCE_FACTOR;

    const titleNeed = Math.max(title.trim().length * titleAdvance, 24);
    const authorTrim = author.trim();
    const authorNeed = authorTrim.length > 0 ? Math.max(authorTrim.length * authorAdvance, 18) : 0;
    const textNeed = titleNeed + (authorNeed > 0 ? SPINE_TITLE_AUTHOR_GAP + authorNeed : 0);
    let textBlockPx = textNeed + SPINE_PAD;

    let widthPx = baseWidth;
    let heightPx = Math.max(baseHeight, Math.ceil(textBlockPx + widthPx * COVER_ASPECT_MIN));

    if (heightPx > SPINE_HEIGHT_MAX_PX) {
        heightPx = SPINE_HEIGHT_MAX_PX;
        const available = heightPx - widthPx * COVER_ASPECT_MIN;
        const cols = Math.max(1, Math.ceil(textNeed / Math.max(available - SPINE_PAD, 1)));
        widthPx = Math.max(baseWidth, Math.min(SPINE_WIDTH_MAX, cols * SPINE_COL_WIDTH + 10));
        // Recompute for the actual number of columns used, so the cover doesn't get starved.
        textBlockPx = Math.ceil(textNeed / cols) + SPINE_PAD;
    }

    // Two separate vertical lines need a little thickness to breathe.
    widthPx = Math.max(widthPx, Math.min(SPINE_WIDTH_MAX, Math.round(SPINE_FONT_PX * 1.6 + 10)));

    // widthPx may have grown since heightPx was picked (columns, breathing room above) —
    // make sure there's still room for the text block plus a minimum-sized cover.
    heightPx = Math.max(heightPx, Math.ceil(textBlockPx + widthPx * COVER_ASPECT_MIN));

    const coverHeightPx = clamp(
        heightPx - textBlockPx,
        widthPx * COVER_ASPECT_MIN,
        widthPx * COVER_ASPECT_MAX
    );

    return {
        widthPx: Math.round(widthPx),
        heightPx: Math.round(heightPx),
        coverHeightPx: Math.round(coverHeightPx),
        textBlockHeightPx: Math.round(textBlockPx),
    };
}

/**
 * Pure arrangement: walks ordered ids and assigns cluster roles.
 * Only upright (vertical) runs and horizontal stacks — no diagonal leans.
 * Horizontal stacks are never adjacent (vertical books always separate them).
 */
export function assignRoles(orderedIds: string[]): RoleAssignment[] {
    const n = orderedIds.length;
    if (n === 0) return [];

    if (n <= 4) {
        return orderedIds.map((_, i) => ({
            role: "upright" as const,
            clusterId: 0,
            clusterPosition: i,
        }));
    }

    const out: RoleAssignment[] = new Array(n);
    let i = 0;
    let clusterId = 0;
    let prevWasStack = false;

    while (i < n) {
        const remaining = n - i;
        const seed = orderedIds[i];

        if (remaining === 1) {
            out[i] = { role: "upright", clusterId, clusterPosition: 0 };
            i += 1;
            clusterId += 1;
            prevWasStack = false;
            continue;
        }

        const roll = hash01(seed, 3);
        // Stacks only when not following another stack — uprights must separate them.
        const wantStack = roll >= 0.6 && !prevWasStack && remaining >= 3;

        if (!wantStack) {
            const runLen = Math.min(2 + Math.floor(hash01(seed, 11) * 4), remaining);
            for (let k = 0; k < runLen; k++) {
                out[i + k] = { role: "upright", clusterId, clusterPosition: k };
            }
            i += runLen;
            prevWasStack = false;
        } else {
            // Prefer full piles (5–8); packer trims anything that exceeds shelf height.
            const stackLen = Math.min(5 + Math.floor(hash01(seed, 19) * 4), remaining);
            for (let k = 0; k < stackLen; k++) {
                out[i + k] = {
                    role: "stack-base",
                    clusterId,
                    clusterPosition: k,
                };
            }
            i += stackLen;
            prevWasStack = true;
        }

        clusterId += 1;
    }

    return out;
}

export async function getBookshelfSpines(): Promise<Spine[]> {
    const books = await fetchShelf(GOODREADS_USER_ID, BOOKSHELF_SHELF);
    if (books.length === 0) return [];

    const titles = books.map((book) => displayTitle(book.id, book.title));
    const overrides = await findCoverOverrides(
        books.map((book, index) => ({ id: book.id, title: titles[index] }))
    );
    const colors = await Promise.all(
        books.map((book, index) => {
            const spineOverride = SPINE_COLOR_OVERRIDES[book.id];
            if (spineOverride) return spineColorFromHex(spineOverride);
            const override = overrides[index];
            return override
                ? vividColorFromFile(override.absolutePath)
                : vividColorFromImage(book.largeImageUrl || book.imageUrl);
        })
    );

    const roles = assignRoles(books.map((b) => b.id));

    return books.map((book: Book, index) => {
        const color = colors[index];
        const role = roles[index];
        const title = titles[index];
        const { widthPx, heightPx, coverHeightPx, textBlockHeightPx } = sizeForSpineText(
            title,
            book.author,
            widthFromPages(book.numPages),
            heightFromId(book.id)
        );
        return {
            id: book.id,
            title,
            author: book.author,
            coverUrl: overrides[index]?.url ?? (book.largeImageUrl || book.imageUrl),
            link: book.link,
            rating: book.userRating,
            pages: book.numPages,
            color: color.hex,
            textColor: color.textColor,
            borderColors: BORDER_COLOR_OVERRIDES[book.id] ?? [color.hex],
            role: role.role,
            widthPx,
            heightPx,
            coverHeightPx,
            textBlockHeightPx,
            clusterId: role.clusterId,
            clusterPosition: role.clusterPosition,
        };
    });
}
