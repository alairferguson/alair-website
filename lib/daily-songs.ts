export type DailySongsPlaylist = {
    year: number;
    cover: string;
    href: string;
};

export const DAILY_SONGS_DESCRIPTION =
    "When I began dating my partner, Alex, on January 1, 2021 (not so creative an anniversary but incredibly helpful for bookkeeping), I began a tradition of sending him a song every day. Initially, it was a way to share my taste in music, but over time, it morphed into a way to force myself to discover new music since songs couldn't repeat within years. As our relationship stretched longer and farther (we've spent the majority of our time together long-distance), the yearly playlists became cherished capsules of a sweet, ritualistic love language that I now share with you as well.";

export const DAILY_SONGS_PLAYLISTS: DailySongsPlaylist[] = [
    {
        year: 2021,
        cover: "/rabbit-holes/daily-songs-2021-cover.jpg",
        href: "https://open.spotify.com/playlist/7JCSUrhkY3bGTg6E46cuNR?si=c13b061f1a334f12",
    },
    {
        year: 2022,
        cover: "/rabbit-holes/daily-songs-2022-cover.jpg",
        href: "https://open.spotify.com/playlist/3Gu7cs0AGVmZ5OJZyOtz5i?si=4ff53985fd9b472d",
    },
    {
        year: 2023,
        cover: "/rabbit-holes/daily-songs-2023-cover.jpg",
        href: "https://open.spotify.com/playlist/6cvkeglLWUzy5nzaCTAsVj?si=b6f0a19ae9d24cae",
    },
    {
        year: 2024,
        cover: "/rabbit-holes/daily-songs-2024-cover.jpg",
        href: "https://open.spotify.com/playlist/5lOH2OCkH4kkX8f3DOUVNT?si=8a69734c071247da",
    },
    {
        year: 2025,
        cover: "/rabbit-holes/daily-songs-2025-cover.jpg",
        href: "https://open.spotify.com/playlist/7k7JnDmekYSD9yjXkJjW0v?si=f7758c98d1114363",
    },
    {
        year: 2026,
        cover: "/rabbit-holes/daily-songs-2026-cover.jpg",
        href: "https://open.spotify.com/playlist/1cV4GikeUfDE1fzIiEAwPI?si=7bd2a94bf1594372",
    },
];

export const DAILY_SONGS_FEATURED_YEAR = 2022;

export function getDailySongsFeaturedPlaylist(): DailySongsPlaylist {
    return (
        DAILY_SONGS_PLAYLISTS.find((p) => p.year === DAILY_SONGS_FEATURED_YEAR) ??
        DAILY_SONGS_PLAYLISTS[0]
    );
}
