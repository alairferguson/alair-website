import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
    pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "i.scdn.co" },
            { protocol: "https", hostname: "i.gr-assets.com" },
        ],
        // Only serves our own trusted, hand-authored local SVGs (rabbit-holes cover art) — no user/remote SVG input.
        dangerouslyAllowSVG: true,
        contentDispositionType: "inline",
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
};

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
});

export default withMDX(nextConfig);
