import Image from "next/image";
import type { DailySongsPlaylist } from "@/lib/daily-songs";

type PlaylistCardProps = {
    playlist: DailySongsPlaylist;
};

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
    return (
        <a
            href={playlist.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col gap-3 rounded-lg bg-white/[0.04] p-4 transition-colors duration-300 hover:bg-white/[0.09]"
        >
            <div className="relative aspect-square w-full overflow-hidden rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                <Image
                    src={playlist.cover}
                    alt={`${playlist.year} playlist cover`}
                    fill
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw"
                    className="object-cover"
                />

                <span
                    className="absolute right-2 bottom-2 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-[#1ED760] text-black opacity-0 shadow-[0_8px_16px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                    aria-hidden="true"
                >
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </span>
            </div>

            <div className="min-w-0">
                <p className="truncate font-semibold text-white">{playlist.year}</p>
                <p className="truncate text-sm text-white/60">Playlist</p>
            </div>
        </a>
    );
}
