import { fetchShelf, type Book } from "./goodreads";
import { averageColorFromImage } from "./spine-color";
import {
    SPINE_HEIGHT_MAX_PX,
    SPINE_HEIGHT_MIN_PX,
    SPINE_HEIGHT_PX,
    SPINE_HEIGHT_SOFT_MAX_PX,
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
const SPINE_CHAR_ADVANCE = SPINE_FONT_PX * 0.62;
const SPINE_TITLE_AUTHOR_GAP = 10;
const SPINE_COVER_RATIO = 0.28;
const SPINE_PAD = 10;
const SPINE_WIDTH_MAX = 72;
const SPINE_COL_WIDTH = SPINE_FONT_PX + 5;

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

/**
 * Grow height (then width) so title + author each fit on their own vertical line.
 * Long names get a taller spine; if that hits the cap, the spine widens so text
 * can wrap into additional vertical columns.
 */
function sizeForSpineText(
    title: string,
    author: string,
    baseWidth: number,
    baseHeight: number
): { widthPx: number; heightPx: number } {
    const titleNeed = Math.max(title.trim().length * SPINE_CHAR_ADVANCE, 24);
    const authorTrim = author.trim();
    const authorNeed = authorTrim.length > 0 ? Math.max(authorTrim.length * SPINE_CHAR_ADVANCE, 18) : 0;
    const textNeed = titleNeed + (authorNeed > 0 ? SPINE_TITLE_AUTHOR_GAP + authorNeed : 0);

    // cover ≈ ratio·H → H ≈ (text + pad) / (1 - ratio)
    let heightPx = Math.ceil((textNeed + SPINE_PAD) / (1 - SPINE_COVER_RATIO));
    heightPx = Math.max(heightPx, baseHeight);

    let widthPx = baseWidth;

    if (heightPx > SPINE_HEIGHT_MAX_PX) {
        heightPx = SPINE_HEIGHT_MAX_PX;
        const available = heightPx * (1 - SPINE_COVER_RATIO) - SPINE_PAD;
        const cols = Math.max(1, Math.ceil(textNeed / Math.max(available, 1)));
        widthPx = Math.max(baseWidth, Math.min(SPINE_WIDTH_MAX, cols * SPINE_COL_WIDTH + 10));
    }

    // Two separate vertical lines need a little thickness to breathe.
    widthPx = Math.max(widthPx, Math.min(SPINE_WIDTH_MAX, Math.round(SPINE_FONT_PX * 1.6 + 10)));

    return { widthPx: Math.round(widthPx), heightPx: Math.round(heightPx) };
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
        const wantStack = roll >= 0.72 && !prevWasStack && remaining >= 3;

        if (!wantStack) {
            const runLen = Math.min(2 + Math.floor(hash01(seed, 11) * 4), remaining);
            for (let k = 0; k < runLen; k++) {
                out[i + k] = { role: "upright", clusterId, clusterPosition: k };
            }
            i += runLen;
            prevWasStack = false;
        } else {
            // Prefer fuller piles (3–5); packer trims anything that exceeds shelf height.
            const stackLen = Math.min(3 + Math.floor(hash01(seed, 19) * 3), remaining);
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

    const colors = await Promise.all(
        books.map((book) => averageColorFromImage(book.largeImageUrl || book.imageUrl))
    );

    const roles = assignRoles(books.map((b) => b.id));

    return books.map((book: Book, index) => {
        const color = colors[index];
        const role = roles[index];
        const title = stripSeriesFromTitle(book.title);
        const { widthPx, heightPx } = sizeForSpineText(
            title,
            book.author,
            widthFromPages(book.numPages),
            heightFromId(book.id)
        );
        return {
            id: book.id,
            title,
            author: book.author,
            coverUrl: book.largeImageUrl || book.imageUrl,
            link: book.link,
            rating: book.userRating,
            pages: book.numPages,
            color: color.hex,
            textColor: color.textColor,
            role: role.role,
            widthPx,
            heightPx,
            clusterId: role.clusterId,
            clusterPosition: role.clusterPosition,
        };
    });
}
