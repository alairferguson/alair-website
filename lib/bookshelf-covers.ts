import path from "node:path";
import { readdir } from "node:fs/promises";

/**
 * Hand-picked cover art, for when a book's Goodreads cover isn't worth using.
 * Drop an image into public/bookshelf-covers/ named after the book — either
 * its title, slugified (e.g. "North Woods" → "north-woods.jpg"), or its
 * Goodreads book id (the numeric id in the review URL) — and it takes over
 * both the spine's cover image and its color.
 */
const COVER_DIR = path.join(process.cwd(), "public", "bookshelf-covers");
const COVER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export type CoverOverride = {
    /** Public URL to hand to <Image>. */
    url: string;
    /** Absolute path on disk, for color extraction. */
    absolutePath: string;
};

async function listCoverFiles(): Promise<string[]> {
    try {
        return await readdir(COVER_DIR);
    } catch {
        return [];
    }
}

export function slugifyTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/['’]/g, "") // drop rather than hyphenate, so "Magician's" → "magicians" (how people name files)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function matchOverride(files: string[], bookId: string, title: string): CoverOverride | null {
    const candidates = [bookId, slugifyTitle(title)];

    for (const candidate of candidates) {
        const match = files.find((file) => {
            const ext = path.extname(file).toLowerCase();
            return COVER_EXTENSIONS.has(ext) && path.basename(file, ext) === candidate;
        });
        if (match) {
            return {
                url: `/bookshelf-covers/${match}`,
                absolutePath: path.join(COVER_DIR, match),
            };
        }
    }
    return null;
}

/** Looks for a matching override by Goodreads id first, then by slugified title. */
export async function findCoverOverride(bookId: string, title: string): Promise<CoverOverride | null> {
    return matchOverride(await listCoverFiles(), bookId, title);
}

/** Batch form of {@link findCoverOverride} — reads the directory once for the whole shelf. */
export async function findCoverOverrides(
    books: { id: string; title: string }[]
): Promise<(CoverOverride | null)[]> {
    const files = await listCoverFiles();
    return books.map((book) => matchOverride(files, book.id, book.title));
}
