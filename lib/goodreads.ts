import { XMLParser } from "fast-xml-parser";

export type Shelf = "read" | "alair-website" | (string & {});

export interface Book {
    id: string;
    title: string;
    author: string;
    link: string;
    imageUrl: string;
    largeImageUrl: string;
    numPages: number | null;
    userRating: number | null;
    dateAdded: string | null;
}

const RSS_BASE_URL = "https://www.goodreads.com/review/list_rss";

function text(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(text).join("");
    if (typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
        return text((value as Record<string, unknown>)["#text"]);
    }
    return String(value);
}

function nonEmpty(value: string): string | null {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function toNumber(value: string): number | null {
    const n = Number(value);
    return Number.isFinite(n) && value.trim() !== "" ? n : null;
}

interface RawItem {
    guid: unknown;
    title: unknown;
    link: unknown;
    book_id: unknown;
    book_image_url: unknown;
    book_large_image_url: unknown;
    author_name: unknown;
    book: unknown; // { num_pages }
    user_rating: unknown;
    user_date_added: unknown;
}

function parseItem(raw: RawItem): Book {
    const book = raw.book as Record<string, unknown> | undefined;
    return {
        id: text(raw.book_id) || text(raw.guid),
        title: text(raw.title),
        author: text(raw.author_name),
        link: text(raw.link),
        imageUrl: text(raw.book_image_url),
        largeImageUrl: text(raw.book_large_image_url) || text(raw.book_image_url),
        numPages: toNumber(text(book?.num_pages)),
        userRating: (() => {
            const n = toNumber(text(raw.user_rating));
            return n && n > 0 ? n : null;
        })(),
        dateAdded: nonEmpty(text(raw.user_date_added)),
    };
}

/**
 * Fetches and parses a public Goodreads shelf via the still-functioning
 * RSS export (Goodreads retired its REST API in Dec 2020). Only works for
 * profiles with public shelves.
 */
export async function fetchShelf(
    userId: string,
    shelf: Shelf,
    { revalidate = 3600 }: { revalidate?: number } = {}
): Promise<Book[]> {
    const url = `${RSS_BASE_URL}/${userId}?shelf=${encodeURIComponent(shelf)}`;
    const res = await fetch(url, { next: { revalidate } });

    if (!res.ok) {
        throw new Error(`Goodreads RSS request failed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    const parser = new XMLParser({ cdataPropName: "#text" });
    const doc = parser.parse(xml);

    const items = doc?.rss?.channel?.item;
    if (!items) return [];

    const rawItems: RawItem[] = Array.isArray(items) ? items : [items];
    return rawItems.map(parseItem);
}
