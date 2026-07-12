import { DAILY_SONGS_FEATURED_YEAR, DAILY_SONGS_PLAYLISTS } from "./daily-songs";

export type RabbitHole = {
    slug: string;
    title: string;
    position: {
        top?: string;
        left?: string;
        right?: string;
        bottom?: string;
    };
    /** Ordered back-to-front; the last image is the top, clicked-into cover. */
    images?: string[];
};

const dailySongsImages = [
    ...DAILY_SONGS_PLAYLISTS.filter((p) => p.year !== DAILY_SONGS_FEATURED_YEAR).map((p) => p.cover),
    ...DAILY_SONGS_PLAYLISTS.filter((p) => p.year === DAILY_SONGS_FEATURED_YEAR).map((p) => p.cover),
];

export const RABBIT_HOLES: RabbitHole[] = [
    {
        slug: "health",
        title: "Health",
        position: { top: "28%", left: "10%" },
    },
    {
        slug: "plants",
        title: "Plants",
        position: { top: "16%", right: "12%" },
    },
    {
        slug: "llm-axelrod-tournament",
        title: "LLM Axelrod Tournament",
        position: { top: "56%", right: "10%" },
    },
    {
        slug: "alairs-daily-songs",
        title: "My Daily Songs",
        position: { top: "56%", left: "12%" },
        images: dailySongsImages,
    },
];

export function getRabbitHoleSlugs(): string[] {
    return RABBIT_HOLES.map((hole) => hole.slug);
}

export function getRabbitHole(slug: string): RabbitHole | undefined {
    return RABBIT_HOLES.find((hole) => hole.slug === slug);
}
