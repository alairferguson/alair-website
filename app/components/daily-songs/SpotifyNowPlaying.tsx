"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Track = {
    title: string;
    artist: string;
    album: string;
    albumArt: string | null;
    url: string;
    progressMs: number | null;
    durationMs: number | null;
};

type NowPlayingResponse =
    | { status: "playing"; track: Track }
    | { status: "recent"; track: Track }
    | { status: "none" };

const POLL_INTERVAL_MS = 30_000;

function EqualizerIcon() {
    return (
        <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
            <span className="eq-bar h-full w-[3px] rounded-full bg-[#1ED760]" style={{ animationDelay: "0ms" }} />
            <span className="eq-bar h-full w-[3px] rounded-full bg-[#1ED760]" style={{ animationDelay: "200ms" }} />
            <span className="eq-bar h-full w-[3px] rounded-full bg-[#1ED760]" style={{ animationDelay: "400ms" }} />
        </span>
    );
}

function SpotifyLogo() {
    return (
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.622.622 0 1 1-.277-1.215c3.809-.871 7.077-.496 9.713 1.115a.623.623 0 0 1 .206.857Zm1.223-2.723a.78.78 0 0 1-1.072.257c-2.688-1.652-6.786-2.131-9.965-1.166a.78.78 0 1 1-.452-1.492c3.632-1.102 8.147-.568 11.232 1.328a.78.78 0 0 1 .257 1.073Zm.105-2.835c-3.223-1.914-8.54-2.09-11.618-1.156a.935.935 0 1 1-.542-1.79c3.532-1.072 9.404-.865 13.115 1.338a.936.936 0 0 1-.955 1.608Z" />
        </svg>
    );
}

export default function SpotifyNowPlaying() {
    const [data, setData] = useState<NowPlayingResponse | null>(null);
    const [liveProgress, setLiveProgress] = useState(0);
    const fetchedAtRef = useRef(0);

    useEffect(() => {
        let cancelled = false;

        async function fetchNowPlaying() {
            try {
                const res = await fetch("/api/spotify/now-playing", { cache: "no-store" });
                const json = (await res.json()) as NowPlayingResponse;
                if (!cancelled) {
                    setData(json);
                    fetchedAtRef.current = Date.now();
                }
            } catch {
                // Widget just won't render if the request fails.
            }
        }

        fetchNowPlaying();
        const interval = setInterval(fetchNowPlaying, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!data || data.status !== "playing") return;
        const { progressMs, durationMs } = data.track;
        if (progressMs == null || durationMs == null) return;

        const tick = () => {
            const elapsed = Date.now() - fetchedAtRef.current;
            setLiveProgress(Math.min(progressMs + elapsed, durationMs));
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [data]);

    if (!data || data.status === "none") return null;

    const { track } = data;
    const isPlaying = data.status === "playing";
    const progressPct =
        isPlaying && track.durationMs ? Math.min(100, (liveProgress / track.durationMs) * 100) : 0;

    return (
        <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-4 rounded-lg bg-[#121212] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                {track.albumArt ? (
                    <div className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-md sm:w-20">
                        <Image
                            src={track.albumArt}
                            alt={`${track.album} cover`}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    </div>
                ) : null}

                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                        {isPlaying ? <EqualizerIcon /> : null}
                        <span className="text-xs font-semibold tracking-wide text-[#1ED760] uppercase">
                            {isPlaying ? "Listening now" : "Last listened to"}
                        </span>
                    </div>
                    <a
                        href={track.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-semibold text-white hover:underline"
                    >
                        {track.title}
                    </a>
                    <p className="truncate text-sm text-white/60">{track.artist}</p>

                    {isPlaying && track.durationMs ? (
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                                className="h-full rounded-full bg-[#1ED760] transition-[width] duration-1000 ease-linear"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    ) : null}
                </div>

                <a
                    href={track.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open in Spotify"
                    className="shrink-0 text-white/40 transition-colors hover:text-[#1ED760]"
                >
                    <SpotifyLogo />
                </a>
            </div>
        </div>
    );
}
