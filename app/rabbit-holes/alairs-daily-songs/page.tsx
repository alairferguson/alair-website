import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import PlaylistCard from "@/app/components/daily-songs/PlaylistCard";
import {
    DAILY_SONGS_DESCRIPTION,
    DAILY_SONGS_PLAYLISTS,
    getDailySongsFeaturedPlaylist,
} from "@/lib/daily-songs";

export const metadata: Metadata = {
    title: "Alair's Daily Songs | Rabbit Holes | Alair",
};

// The site-wide `h1, h2, ... { font-family: var(--font-heading); font-style: italic }`
// rule in globals.css is unlayered, so it beats Tailwind's layered utility classes
// (e.g. font-sans, not-italic) regardless of specificity. Inline styles are the only
// reliable way to opt this page's headings out of it.
const sansHeading: React.CSSProperties = {
    fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    fontStyle: "normal",
};

export default function DailySongsPage() {
    const featured = getDailySongsFeaturedPlaylist();

    return (
        <div className="min-h-dvh w-full bg-[#0a0a0a] font-sans text-white">
            <div className="relative overflow-hidden bg-gradient-to-b from-[#4c1440] via-[#1a0f2e] to-[#0a0a0a] px-6 pt-20 pb-10 sm:px-10 sm:pt-24 md:px-14">
                <Link
                    href="/#rabbit-holes"
                    aria-label="Back to Rabbit Holes"
                    className="absolute top-5 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:top-6 sm:left-6"
                >
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M15.5 3.5 6 12l9.5 8.5 1.4-1.4L9 12l7.9-7.1z" />
                    </svg>
                </Link>

                <div className="mx-auto flex max-w-5xl flex-col gap-6">
                    <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                        <span className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">
                            Collection
                        </span>
                        <h1
                            className="text-4xl leading-[1.05] font-black tracking-tight sm:text-6xl"
                            style={sansHeading}
                        >
                            Alair&apos;s Daily Songs
                        </h1>
                    </div>

                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
                        <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-md shadow-[0_16px_40px_rgba(0,0,0,0.6)] sm:w-52">
                            <Image
                                src={featured.cover}
                                alt={`${featured.year} playlist cover`}
                                fill
                                sizes="(min-width: 640px) 208px, 160px"
                                className="object-cover"
                                priority
                            />
                        </div>

                        <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                            <p className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                                {DAILY_SONGS_DESCRIPTION}
                            </p>
                            <p className="text-sm text-white/60">
                                {DAILY_SONGS_PLAYLISTS.length} playlists · a song every day since January 1, 2021
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 sm:px-10 md:px-14">
                <div className="mx-auto max-w-5xl">
                    <h2 className="mb-4 text-xl font-bold sm:text-2xl" style={sansHeading}>
                        Playlists
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
                        {DAILY_SONGS_PLAYLISTS.map((playlist) => (
                            <PlaylistCard key={playlist.year} playlist={playlist} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 pb-12 sm:px-10 md:px-14">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/#rabbit-holes"
                        className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                        ← Back to Rabbit Holes
                    </Link>
                </div>
            </div>
        </div>
    );
}
