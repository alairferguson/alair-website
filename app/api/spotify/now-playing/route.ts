import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type SpotifyImage = { url: string };
type SpotifyArtist = { name: string };
type SpotifyItem = {
    name: string;
    duration_ms: number;
    artists: SpotifyArtist[];
    album: { name: string; images: SpotifyImage[] };
    external_urls: { spotify: string };
};

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

async function getAccessToken(): Promise<string | null> {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) return null;

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const res = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
        cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.access_token === "string" ? data.access_token : null;
}

function trackFromItem(item: SpotifyItem): Track {
    return {
        title: item.name,
        artist: item.artists.map((a) => a.name).join(", "),
        album: item.album.name,
        albumArt: item.album.images[0]?.url ?? null,
        url: item.external_urls.spotify,
        progressMs: null,
        durationMs: item.duration_ms,
    };
}

export async function GET() {
    const accessToken = await getAccessToken();
    if (!accessToken) {
        return NextResponse.json({ status: "none" } satisfies NowPlayingResponse);
    }

    const authHeaders = { Authorization: `Bearer ${accessToken}` };

    const nowRes = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: authHeaders,
        cache: "no-store",
    });

    if (nowRes.status === 200) {
        const nowData = await nowRes.json();
        // Only ever surface tracks, never podcast episodes.
        if (nowData?.currently_playing_type === "track" && nowData.item) {
            const track = trackFromItem(nowData.item);
            track.progressMs = nowData.progress_ms ?? null;
            return NextResponse.json({
                status: nowData.is_playing ? "playing" : "recent",
                track,
            } satisfies NowPlayingResponse);
        }
    }

    // Nothing (musical) playing right now — fall back to the last played track.
    const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: authHeaders,
        cache: "no-store",
    });

    if (recentRes.ok) {
        const recentData = await recentRes.json();
        const item = recentData?.items?.[0]?.track;
        if (item) {
            return NextResponse.json({
                status: "recent",
                track: trackFromItem(item),
            } satisfies NowPlayingResponse);
        }
    }

    return NextResponse.json({ status: "none" } satisfies NowPlayingResponse);
}
